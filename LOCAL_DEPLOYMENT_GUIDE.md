# 本地开发与部署指南

## 目录

- [环境要求](#环境要求)
- [快速开始](#快速开始)
- [环境配置](#环境配置)
- [数据库配置](#数据库配置)
- [开发模式](#开发模式)
- [生产部署](#生产部署)
- [常见问题](#常见问题)

---

## 环境要求

### 必需软件

- **Node.js**: 24.x 或更高版本
- **pnpm**: 9.0.0 或更高版本
- **PostgreSQL**: 14.x 或更高版本
- **Git**: 2.x 或更高版本

### 推荐工具（可选）

- **Docker**: 用于运行 PostgreSQL 数据库
- **pgAdmin**: PostgreSQL 图形化管理工具

---

## 快速开始

### 1. 克隆项目

```bash
git clone <项目仓库地址>
cd <项目目录>
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，填入你的配置
```

### 4. 配置数据库

#### 选项 A: 使用本地 PostgreSQL

```bash
# 创建数据库
createdb aicollaboration

# 或使用 psql
psql -U postgres
CREATE DATABASE aicollaboration;
\q
```

#### 选项 B: 使用 Docker 运行 PostgreSQL

```bash
docker run -d \
  --name postgres-dev \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=aicollaboration \
  -p 5432:5432 \
  postgres:14-alpine
```

### 5. 应用数据库迁移

```bash
pnpm run db:push
```

### 6. 启动开发服务器

```bash
pnpm run dev
```

访问 http://localhost:15000 查看应用。

---

## 环境配置

### 环境变量说明

创建 `.env` 文件（从 `.env.example` 复制），并配置以下变量：

| 变量名 | 说明 | 示例 | 必需 |
|--------|------|------|------|
| `DATABASE_URL` | PostgreSQL 连接字符串 | `postgresql://user:pass@localhost:5432/db` | ✅ |
| `JWT_SECRET` | JWT 密钥（至少32位） | `your-super-secret-jwt-key-12345` | ✅ |
| `JWT_ACCESS_TOKEN_EXPIRES_IN` | Access Token 过期时间（秒） | `86400` | ❌ |
| `JWT_REFRESH_TOKEN_EXPIRES_IN` | Refresh Token 过期时间（秒） | `604800` | ❌ |
| `PORT` | 应用端口 | `5000` | ❌ |
| `NODE_ENV` | 运行环境 | `development` / `production` | ❌ |
| `APP_URL` | 应用基础 URL | `http://localhost:5000` | ❌ |

### 生成 JWT 密钥

```bash
# 使用 Node.js 生成随机密钥
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 数据库配置

### 方式 1: 本地安装 PostgreSQL

#### Ubuntu/Debian

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### macOS

```bash
brew install postgresql@14
brew services start postgresql@14
```

#### Windows

从 [PostgreSQL 官网](https://www.postgresql.org/download/windows/) 下载安装。

### 方式 2: 使用 Docker

```bash
# 运行 PostgreSQL 容器
docker run -d \
  --name postgres-dev \
  --restart always \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=aicollaboration \
  -p 5432:5432 \
  -v postgres-data:/var/lib/postgresql/data \
  postgres:14-alpine

# 停止容器
docker stop postgres-dev

# 启动容器
docker start postgres-dev

# 删除容器
docker rm postgres-dev
```

### 数据库迁移

项目使用 Drizzle ORM 管理数据库结构。

#### 开发环境（推荐）

```bash
# 直接推送 Schema 变更到数据库
pnpm run db:push
```

#### 生产环境

```bash
# 生成迁移文件
pnpm run db:generate

# 应用迁移文件
bash ./scripts/apply-migration.sh
```

#### 可视化管理

```bash
# 启动 Drizzle Studio（默认端口 4983）
pnpm run db:studio
```

访问 http://localhost:4983 进行数据库可视化管理。

---

## 开发模式

### 启动开发服务器

```bash
pnpm run dev
```

开发服务器默认运行在 http://localhost:5000，支持：

- ✅ 热模块替换（HMR）
- ✅ 快速刷新
- ✅ TypeScript 类型检查
- ✅ ESLint 代码检查

### 开发命令

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm run dev

# TypeScript 类型检查
pnpm run ts-check

# 代码检查
pnpm run lint

# 生成数据库迁移
pnpm run db:generate

# 推送数据库变更
pnpm run db:push

# 启动数据库可视化工具
pnpm run db:studio
```

### 开发工作流

1. **修改代码**: 编辑 `src/` 目录下的文件
2. **自动编译**: 保存文件后自动重新编译
3. **浏览器刷新**: 自动刷新浏览器查看更改
4. **类型检查**: 运行 `pnpm run ts-check` 检查类型错误
5. **提交代码**: 提交前运行 `pnpm run lint` 检查代码质量

---

## 生产部署

### 1. 准备生产环境

#### 创建生产环境配置

```bash
cp .env.example .env.production
# 编辑 .env.production，设置生产环境变量
```

生产环境关键配置：

```env
DATABASE_URL=postgresql://prod_user:strong_password@prod-db.example.com:5432/aicollaboration
JWT_SECRET=<使用强随机密钥>
NODE_ENV=production
APP_URL=https://your-domain.com
```

### 2. 安装依赖并构建

```bash
# 安装依赖
pnpm install --prod

# 构建项目
pnpm run build
```

### 3. 应用数据库迁移

```bash
# 在生产服务器上
bash ./scripts/apply-migration.sh
```

### 4. 启动生产服务器

```bash
pnpm start
```

### 5. 使用 PM2 管理进程（推荐）

```bash
# 安装 PM2
pnpm add -D pm2

# 启动应用
pnpm pm2 start npm --name "aicollaboration" -- start

# 查看状态
pnpm pm2 status

# 查看日志
pnpm pm2 logs

# 重启应用
pnpm pm2 restart aicollaboration

# 停止应用
pnpm pm2 stop aicollaboration
```

### 6. 配置反向代理（Nginx）

创建 Nginx 配置文件 `/etc/nginx/sites-available/aicollaboration`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL 证书配置
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    # SSL 优化
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;

    # 代理到 Next.js 应用
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 静态文件缓存
    location /_next/static {
        proxy_pass http://localhost:5000;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, immutable";
    }
}
```

启用配置：

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/aicollaboration /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

### 7. 配置 HTTPS（Let's Encrypt）

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取 SSL 证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

---

## 常见问题

### 1. 数据库连接失败

**错误信息**: `Connection refused` 或 `Password authentication failed`

**解决方案**:
- 检查 `DATABASE_URL` 是否正确
- 确认 PostgreSQL 服务是否运行
- 验证用户名和密码是否正确

```bash
# 测试数据库连接
psql $DATABASE_URL
```

### 2. 端口被占用

**错误信息**: `Port 5000 is already in use`

**解决方案**:

```bash
# 查找占用端口的进程
lsof -i :5000

# 或使用 ss 命令
ss -lntp | grep :5000

# 终止进程
kill -9 <PID>

# 或修改 .env 中的 PORT
PORT=3001 pnpm run dev
```

### 3. 迁移失败

**错误信息**: `Migration failed`

**解决方案**:
- 备份数据库
- 检查迁移文件 SQL 语法
- 尝试使用 `pnpm run db:push` 强制同步（⚠️ 可能导致数据丢失）

### 4. JWT Token 验证失败

**错误信息**: `Invalid token` 或 `Token expired`

**解决方案**:
- 检查 `JWT_SECRET` 是否一致
- 确认 Token 未过期
- 检查 Token 格式是否正确

### 5. 构建失败

**错误信息**: `Build failed`

**解决方案**:
- 清理缓存：`rm -rf .next`
- 删除 `node_modules` 并重新安装
- 检查 TypeScript 类型错误

```bash
rm -rf .next node_modules
pnpm install
pnpm run build
```

### 6. 生产环境 404 错误

**解决方案**:
- 检查 Nginx 配置
- 确认 Next.js 应用正在运行
- 查看应用日志排查问题

---

## 附录

### 项目结构

```
.
├── src/
│   ├── app/                 # Next.js App Router 页面
│   ├── components/          # React 组件
│   ├── lib/                 # 工具库
│   ├── contexts/            # React Context
│   ├── storage/             # 数据存储
│   │   └── database/        # 数据库相关
│   └── types/               # TypeScript 类型定义
├── public/                  # 静态资源
├── scripts/                 # 脚本文件
├── docs/                    # 文档
├── .env.example            # 环境变量示例
├── .coze                   # Coze CLI 配置
├── drizzle.config.ts       # Drizzle 配置
├── next.config.ts          # Next.js 配置
├── package.json            # 项目依赖
└── tsconfig.json           # TypeScript 配置
```

### 技术栈

- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript 5
- **UI**: React 19 + shadcn/ui
- **样式**: Tailwind CSS 4
- **ORM**: Drizzle ORM
- **数据库**: PostgreSQL
- **认证**: JWT (jsonwebtoken)
- **密码**: bcryptjs

### 相关文档

- [Next.js 文档](https://nextjs.org/docs)
- [Drizzle ORM 文档](https://orm.drizzle.team/)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [shadcn/ui 文档](https://ui.shadcn.com/)

---

## 支持

如果遇到问题，请查看：

1. [DATABASE_MIGRATION.md](./DATABASE_MIGRATION.md) - 数据库迁移指南
2. [docs/REQUIREMENTS.md](./docs/REQUIREMENTS.md) - 项目需求文档
3. 项目的 Issue Tracker

---

**祝开发顺利！** 🚀
