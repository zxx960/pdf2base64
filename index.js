import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import util from 'util';
import sharp from 'sharp';
const execAsync = util.promisify(exec);
const app = new Hono();
const PORT = process.env.PORT || 3000;

// 配置上传（Hono内置解析multipart，通过 FormData 读取，使用临时目录存储）

// 中间件

// PDF转图片API接口
app.post('/convert-pdf', async (c) => {
  try {
    const form = await c.req.formData();
    const file = form.get('pdf');
    if (!file || typeof file === 'string') {
      return c.json({ success: false, message: '请上传PDF文件' }, 400);
    }

    const isPdf = (file.type === 'application/pdf') || (file.name && file.name.toLowerCase().endsWith('.pdf'));
    if (!isPdf) {
      return c.json({ success: false, message: '只支持PDF文件上传' }, 400);
    }

    const tmpDir = os.tmpdir();
    const filename = `${Date.now()}-${file.name || 'upload.pdf'}`;
    const pdfPath = path.join(tmpDir, filename);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(pdfPath, buffer);

    const outputPrefix = path.basename(pdfPath, '.pdf');
    const outputFile = path.resolve(path.join(tmpDir, `${outputPrefix}-1.png`));

    const command = `pdftoppm -png -f 1 -l 1 "${pdfPath}" "${path.join(tmpDir, outputPrefix)}"`;

    try {
      await execAsync(command);

      if (fs.existsSync(outputFile)) {
        let imageBuffer = fs.readFileSync(outputFile);
        try {
          const metadata = await sharp(imageBuffer).metadata();
          if (metadata.width && metadata.height && metadata.width > metadata.height) {
            imageBuffer = await sharp(imageBuffer).rotate(90).toBuffer();
          }
        } catch (rotationError) {
          console.warn('Auto-rotation skipped:', rotationError.message);
        }

        const base64Image = imageBuffer.toString('base64');

        fs.unlinkSync(pdfPath);
        fs.unlinkSync(outputFile);

        return c.json({
          success: true,
          message: '转换成功',
          data: {
            base64: `data:image/png;base64,${base64Image}`,
            fileSize: imageBuffer.length,
            base64Length: base64Image.length
          }
        });
      } else {
        fs.unlinkSync(pdfPath);
        return c.json({ success: false, message: '转换失败：未能生成图片文件' }, 500);
      }
    } catch (conversionError) {
      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
      }
      return c.json({ success: false, message: '转换失败', error: conversionError.message }, 500);
    }
  } catch (error) {
    return c.json({ success: false, message: '服务器错误', error: error.message }, 500);
  }
});

// 健康检查接口
app.get('/health', (c) => c.json({
  success: true,
  message: 'PDF转换服务运行正常',
  timestamp: new Date().toISOString()
}));

// 根路径 - 返回静态页面
app.get('/', serveStatic({ path: './public/index.html' }));

// 错误处理
app.onError((error, c) => {
  return c.json({ success: false, message: error.message || '服务器内部错误' }, 500);
});

// 静态资源 - 提供 public 下的静态文件（仅限 GET）
app.get('/*', serveStatic({ root: './public' }));

console.log(`PDF转换服务已启动，监听端口: ${PORT}`);
console.log(`API文档:`);
console.log(`  POST /convert-pdf - 上传PDF文件转换为base64图片`);
console.log(`  GET /health - 健康检查`);
console.log(`  GET / - 静态页面（public/index.html）`);
serve({ fetch: app.fetch, port: Number(PORT), hostname: '0.0.0.0' });
