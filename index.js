const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const path = require("path");
const fs = require('fs');
const util = require('util');
const execAsync = util.promisify(exec);

const app = express();
const PORT = process.env.PORT || 3000;

// 配置multer用于文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/tmp/'); // 临时存储目录
  },
  filename: function (req, file, cb) {
    // 使用时间戳避免文件名冲突
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    // 只允许PDF文件
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('只支持PDF文件上传'), false);
    }
  }
});

// 中间件
app.use(express.json());

// PDF转图片API接口
app.post('/convert-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请上传PDF文件'
      });
    }

    const pdfPath = req.file.path;
    const outputPrefix = path.basename(pdfPath, '.pdf');
    const outputFile = path.resolve(`/tmp/${outputPrefix}-1.png`);

    // 使用pdftoppm命令转换PDF第一页为PNG
    const command = `pdftoppm -png -f 1 -l 1 "${pdfPath}" "/tmp/${outputPrefix}"`;

    try {
      await execAsync(command);

      // 检查生成的文件是否存在
      if (fs.existsSync(outputFile)) {
        // 读取图片文件并转换为base64
        const imageBuffer = fs.readFileSync(outputFile);
        const base64Image = imageBuffer.toString('base64');

        // 清理临时文件
        fs.unlinkSync(pdfPath); // 删除上传的PDF文件
        fs.unlinkSync(outputFile); // 删除生成的PNG文件

        res.json({
          success: true,
          message: '转换成功',
          data: {
            base64: `data:image/png;base64,${base64Image}`,
            fileSize: imageBuffer.length,
            base64Length: base64Image.length
          }
        });
      } else {
        // 清理PDF文件
        fs.unlinkSync(pdfPath);
        res.status(500).json({
          success: false,
          message: '转换失败：未能生成图片文件'
        });
      }
    } catch (conversionError) {
      // 清理PDF文件
      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
      }
      res.status(500).json({
        success: false,
        message: '转换失败',
        error: conversionError.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
});

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'PDF转换服务运行正常',
    timestamp: new Date().toISOString()
  });
});

// 根路径
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'PDF转Base64转换服务',
    endpoints: {
      'POST /convert-pdf': '上传PDF文件，返回第一页的base64图片',
      'GET /health': '健康检查',
      'GET /': '服务信息'
    }
  });
});

// 错误处理中间件
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: '文件过大'
      });
    }
  }
  res.status(500).json({
    success: false,
    message: error.message || '服务器内部错误'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`PDF转换服务已启动，监听端口: ${PORT}`);
  console.log(`API文档:`);
  console.log(`  POST /convert-pdf - 上传PDF文件转换为base64图片`);
  console.log(`  GET /health - 健康检查`);
  console.log(`  GET / - 服务信息`);
});
