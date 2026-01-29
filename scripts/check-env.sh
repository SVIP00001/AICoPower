#!/bin/bash

# 环境检查脚本
# 检查本地开发环境是否配置正确

set -e

echo "🔍 检查本地开发环境配置..."
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查函数
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✅${NC} $1 已安装: $($1 --version | head -n 1)"
        return 0
    else
        echo -e "${RED}❌${NC} $1 未安装"
        return 1
    fi
}

check_env() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅${NC} $1 文件存在"
        return 0
    else
        echo -e "${RED}❌${NC} $1 文件不存在"
        return 1
    fi
}

# 检查 Node.js
echo "1. 检查 Node.js..."
if check_command node; then
    NODE_VERSION=$(node -v)
    if [[ $NODE_VERSION =~ ^v24 ]]; then
        echo -e "${GREEN}  ✓${NC} Node.js 版本正确 ($NODE_VERSION)"
    else
        echo -e "${YELLOW}  ⚠${NC}  建议使用 Node.js 24.x (当前: $NODE_VERSION)"
    fi
else
    echo -e "${RED}  请安装 Node.js 24.x: https://nodejs.org/${NC}"
    exit 1
fi
echo ""

# 检查 pnpm
echo "2. 检查 pnpm..."
if check_command pnpm; then
    PNPM_VERSION=$(pnpm --version)
    if [ "$PNPM_VERSION" = "9.0.0" ] || [ "$PNPM_VERSION" \> "9.0.0" ]; then
        echo -e "${GREEN}  ✓${NC} pnpm 版本正确 ($PNPM_VERSION)"
    else
        echo -e "${YELLOW}  ⚠${NC}  建议使用 pnpm 9.0+ (当前: $PNPM_VERSION)"
    fi
else
    echo -e "${RED}  请安装 pnpm: npm install -g pnpm${NC}"
    exit 1
fi
echo ""

# 检查 PostgreSQL
echo "3. 检查 PostgreSQL..."
if check_command psql; then
    echo -e "${GREEN}  ✓${NC} PostgreSQL 客户端已安装"
else
    echo -e "${YELLOW}  ⚠${NC}  PostgreSQL 客户端未安装（可选）"
    echo -e "     你可以使用 Docker 运行数据库"
fi
echo ""

# 检查 Docker
echo "4. 检查 Docker..."
if check_command docker; then
    echo -e "${GREEN}  ✓${NC} Docker 已安装"
    if docker info &> /dev/null; then
        echo -e "${GREEN}  ✓${NC} Docker 服务正在运行"
    else
        echo -e "${YELLOW}  ⚠${NC}  Docker 服务未运行"
    fi
else
    echo -e "${YELLOW}  ⚠${NC}  Docker 未安装（可选）"
    echo -e "     安装 Docker: https://docs.docker.com/get-docker/"
fi
echo ""

# 检查 Git
echo "5. 检查 Git..."
check_command git
echo ""

# 检查项目文件
echo "6. 检查项目文件..."
check_env .env.example
check_env .coze
check_env package.json
check_env drizzle.config.ts
echo ""

# 检查 node_modules
echo "7. 检查依赖..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅${NC} node_modules 目录存在"
else
    echo -e "${YELLOW}⚠${NC}  node_modules 目录不存在，请运行: pnpm install"
fi
echo ""

# 检查 .env 文件
echo "8. 检查环境变量..."
if check_env .env; then
    echo -e "${GREEN}  ✓${NC} .env 文件已配置"
    
    # 检查必需的环境变量
    if grep -q "DATABASE_URL" .env && grep -q "JWT_SECRET" .env; then
        echo -e "${GREEN}  ✓${NC} 必需的环境变量已设置"
    else
        echo -e "${YELLOW}  ⚠${NC}  请确保设置了 DATABASE_URL 和 JWT_SECRET"
    fi
else
    echo -e "${YELLOW}  ⚠${NC}  .env 文件不存在，请运行: cp .env.example .env"
    echo -e "     然后编辑 .env 文件配置环境变量"
fi
echo ""

# 测试数据库连接
echo "9. 测试数据库连接..."
if [ -f ".env" ]; then
    source .env 2>/dev/null || true
    if [ -n "$DATABASE_URL" ]; then
        if psql "$DATABASE_URL" -c "SELECT 1" > /dev/null 2>&1; then
            echo -e "${GREEN}✅${NC} 数据库连接成功"
            
            # 检查数据库表
            TABLE_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'" 2>/dev/null | tr -d ' ' || echo "0")
            echo -e "${GREEN}  ✓${NC} 数据库中有 $TABLE_COUNT 张表"
        else
            echo -e "${RED}❌${NC} 数据库连接失败"
            echo -e "     请检查 DATABASE_URL 配置和数据库服务是否运行"
        fi
    else
        echo -e "${YELLOW}⚠${NC}  DATABASE_URL 未设置"
    fi
else
    echo -e "${YELLOW}⚠${NC}  跳过数据库连接测试（.env 文件不存在）"
fi
echo ""

# 总结
echo "==================================="
echo "🎯 检查完成！"
echo ""
echo "如果所有检查都通过，你可以运行："
echo "  ./scripts/start-dev.sh    # 启动开发环境"
echo "  pnpm run dev              # 仅启动开发服务器"
echo "  pnpm run db:push          # 应用数据库迁移"
echo ""
echo "如果遇到问题，请查看："
echo "  LOCAL_DEPLOYMENT_GUIDE.md - 完整的部署指南"
echo ""
