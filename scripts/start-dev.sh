#!/bin/bash

# 本地开发快速启动脚本
# 一键启动开发环境（包括数据库和应用）

set -e

echo "🚀 启动本地开发环境..."
echo ""

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    pnpm install
fi

# 检查 .env 文件
if [ ! -f ".env" ]; then
    echo "⚠️  未找到 .env 文件，从 .env.example 复制..."
    cp .env.example .env
    echo "❗ 请编辑 .env 文件，配置你的数据库连接和 JWT 密钥"
    echo ""
    read -p "按 Enter 继续，或按 Ctrl+C 取消..."
fi

# 检查数据库连接
echo "🔍 检查数据库连接..."
if psql "$DATABASE_URL" -c "SELECT 1" > /dev/null 2>&1; then
    echo "✅ 数据库连接成功"
else
    echo "⚠️  数据库连接失败，请检查 .env 中的 DATABASE_URL"
    echo ""
    echo "💡 提示: 如果你使用 Docker 运行 PostgreSQL，可以先运行："
    echo "   docker run -d --name postgres-dev \\"
    echo "     -e POSTGRES_USER=postgres \\"
    echo "     -e POSTGRES_PASSWORD=postgres \\"
    echo "     -e POSTGRES_DB=aicollaboration \\"
    echo "     -p 5432:5432 \\"
    echo "     postgres:14-alpine"
    echo ""
    exit 1
fi

# 应用数据库迁移
echo "🗄️  应用数据库迁移..."
pnpm run db:push

# 启动开发服务器
echo "🎯 启动开发服务器..."
echo ""
echo "✨ 开发环境已启动！"
echo "📱 访问: http://localhost:15000"
echo ""
echo "按 Ctrl+C 停止服务器"
echo ""

pnpm run dev
