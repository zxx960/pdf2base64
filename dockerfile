# 用 Node.js 官方镜像
FROM dziuivcxl6bco3.xuanyuan.run/node:18

# 安装 Poppler
RUN apt-get update && apt-get install -y poppler-utils && rm -rf /var/lib/apt/lists/*

# 设置工作目录
WORKDIR /app

# 复制依赖文件并安装
COPY package*.json ./
RUN npm install

# 复制项目文件
COPY . .

# 暴露端口
EXPOSE 3000

# 启动
CMD ["npm", "start"]
