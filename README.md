# PDF转Base64转换器

一个基于Node.js和Express的PDF转Base64图片转换服务，支持将PDF文件的第一页转换为PNG格式的Base64编码图片。

## ✨ 特性

- 🚀 **高性能转换** - 使用Poppler工具进行PDF处理
- 🎨 **现代化Web界面** - 响应式设计，支持拖拽上传
- 🐳 **Docker支持** - 一键部署，环境一致性
- 🔒 **安全可靠** - 自动清理临时文件，文件类型验证
- ⚡ **实时反馈** - 转换进度显示，详细统计信息
- 📋 **便捷复制** - 一键复制Base64数据到剪贴板

## 🛠 技术栈

- **后端**: Node.js, Express.js, Multer
- **前端**: 原生JavaScript, HTML5, CSS3
- **PDF处理**: Poppler Utils (pdftoppm)
- **容器化**: Docker
- **版本控制**: Git

## 🚀 快速开始

### 方法一：Docker运行（推荐）

```bash
# 1. 克隆项目
git clone <your-repo-url>
cd pdf

# 2. 构建Docker镜像
docker build -t pdf-api .

# 3. 运行容器
docker run -d -p 3000:3000 --name pdf-api-container pdf-api
```

### 方法二：本地运行

```bash
# 1. 安装依赖
npm install

# 2. 启动服务
npm start
```

**注意**: 本地运行需要系统安装Poppler工具：
- Ubuntu/Debian: `sudo apt-get install poppler-utils`
- macOS: `brew install poppler`
- Windows: 下载Poppler二进制文件

## 📖 使用方法

### Web界面

访问 `http://localhost:3000` 打开Web界面：

1. 点击或拖拽上传PDF文件
2. 点击"开始转换"按钮
3. 查看转换结果和Base64数据
4. 一键复制Base64编码

### API接口

#### 上传转换PDF

```bash
POST /convert-pdf
Content-Type: multipart/form-data

curl -X POST -F "pdf=@example.pdf" http://localhost:3000/convert-pdf
```

**响应示例**:
```json
{
  "success": true,
  "message": "转换成功",
  "data": {
    "base64": "data:image/png;base64,iVBORw0KGgo...",
    "fileSize": 1024000,
    "base64Length": 1365333
  }
}
```

#### 健康检查

```bash
GET /health
```

#### 服务信息

```bash
GET /
```

## 📁 项目结构

```
pdf/
├── public/                 # 静态文件目录
│   └── index.html          # Web界面
├── .gitignore             # Git忽略文件
├── dockerfile             # Docker配置
├── index.js              # 主服务文件
├── package.json          # 项目配置
├── package-lock.json     # 依赖锁定
└── README.md            # 项目文档
```

## 🔧 配置说明

### 环境变量

- `PORT` - 服务端口 (默认: 3000)

### Docker配置

- **基础镜像**: Node.js 18
- **暴露端口**: 3000
- **依赖**: Poppler Utils

### 支持的文件格式

- **输入**: PDF文件 (.pdf)
- **输出**: PNG图片 (Base64编码)

## 📊 性能特点

- **内存占用**: 低内存消耗，自动清理临时文件
- **处理速度**: 快速转换，通常1-3秒完成
- **文件支持**: 支持各种大小的PDF文件
- **并发处理**: 支持多用户同时使用

## 🛡 安全特性

- ✅ 文件类型验证（仅允许PDF）
- ✅ 自动清理上传的临时文件
- ✅ 错误处理和异常捕获
- ✅ 输入参数验证
- ✅ 沙箱环境运行（Docker）

## 🔍 故障排除

### 常见问题

1. **转换失败**: 检查PDF文件是否损坏
2. **端口占用**: 更改PORT环境变量
3. **Docker构建失败**: 检查网络连接和磁盘空间
4. **文件上传失败**: 确认文件为PDF格式且大小合理

### 日志查看

```bash
# 查看容器日志
docker logs pdf-api-container

# 实时查看日志
docker logs -f pdf-api-container
```

## 📈 开发指南

### 本地开发

```bash
# 安装开发依赖
npm install

# 启动开发服务器
npm start

# 代码风格检查
npm run lint  # (需要配置)
```

### 构建优化

- 使用.dockerignore减少构建上下文
- 多阶段构建优化镜像大小
- 依赖缓存加速构建过程

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支: `git checkout -b feature/amazing-feature`
3. 提交更改: `git commit -m 'Add amazing feature'`
4. 推送分支: `git push origin feature/amazing-feature`
5. 提交Pull Request

## 📄 许可证

本项目采用 ISC 许可证 - 详见 [LICENSE](LICENSE) 文件

## 🔗 相关链接

- [Express.js 官方文档](https://expressjs.com/)
- [Multer 文件上传](https://github.com/expressjs/multer)
- [Poppler 工具](https://poppler.freedesktop.org/)
- [Docker 官方文档](https://docs.docker.com/)

## 📞 支持与反馈

如果您遇到问题或有改进建议，请：

1. 查看 [常见问题](#故障排除) 部分
2. 在 GitHub 上创建 [Issue](../../issues)
3. 联系项目维护者

---

**⚠️ 注意**: 本工具仅处理PDF的第一页。如需处理多页PDF，请修改代码中的页面参数。