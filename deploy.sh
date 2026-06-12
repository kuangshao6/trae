#!/bin/bash
# AI小说家创作平台 - 阿里云 VPS 一键部署脚本
# 使用方法：ssh root@123.57.208.22 后执行此脚本

set -e

echo "========================================="
echo "  AI小说家创作平台 - 一键部署"
echo "========================================="

# 第1步：更新系统 + 安装基础工具
echo ""
echo "[1/8] 更新系统 + 安装基础工具..."
apt update && apt upgrade -y
apt install -y curl git nginx

# 第2步：安装 Node.js 20
echo ""
echo "[2/8] 安装 Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
echo "Node.js 版本：$(node -v)"
echo "npm 版本：$(npm -v)"

# 第3步：安装 PM2
echo ""
echo "[3/8] 安装 PM2..."
npm install -g pm2

# 第4步：克隆项目代码
echo ""
echo "[4/8] 克隆项目代码..."
if [ -d "/opt/trae" ]; then
  echo "目录已存在，拉取最新代码..."
  cd /opt/trae && git pull
else
  cd /opt && git clone https://github.com/kuangshao6/trae.git
  cd /opt/trae
fi

# 第5步：安装依赖
echo ""
echo "[5/8] 安装依赖..."
npm install

# 第6步：配置环境变量
echo ""
echo "[6/8] 配置环境变量..."
cat > /opt/trae/.env << 'ENVEOF'
AI_API_KEY=ark-776a3ae4-4224-48e2-8c08-03ff8499a13b-859ff
AI_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
AI_MODEL=ep-20260609212746-74mph
FRONTEND_URL=http://123.57.208.22
ENVEOF
echo "环境变量已配置"

# 第7步：构建前端
echo ""
echo "[7/8] 构建前端..."
npm run build

# 第8步：配置 Nginx + 启动后端
echo ""
echo "[8/8] 配置 Nginx + 启动后端..."

# 配置 Nginx
cat > /etc/nginx/sites-available/ai-novelist << 'NGINXEOF'
server {
    listen 80;
    server_name 123.57.208.22;

    # 前端静态文件
    location / {
        root /opt/trae/dist;
        try_files $uri $uri/ /index.html;
    }

    # API 反向代理
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
NGINXEOF

ln -sf /etc/nginx/sites-available/ai-novelist /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# 启动后端
pm2 delete ai-novelist 2>/dev/null || true
pm2 start "npx tsx api/server.ts" --name ai-novelist
pm2 save

# 设置开机自启
pm2 startup | tail -1 | bash 2>/dev/null || true

echo ""
echo "========================================="
echo "  部署完成！"
echo "  访问地址：http://123.57.208.22"
echo "========================================="
echo ""
echo "常用命令："
echo "  查看日志：pm2 logs ai-novelist"
echo "  重启后端：pm2 restart ai-novelist"
echo "  更新部署：cd /opt/trae && git pull && npm install && npm run build && pm2 restart ai-novelist"
