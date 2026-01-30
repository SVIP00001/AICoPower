# 本地开发部署 - 快速参考

## 📚 文档索引

- [LOCAL_DEPLOYMENT_GUIDE.md](./LOCAL_DEPLOYMENT_GUIDE.md) - 完整的本地开发与部署指南
- [DATABASE_MIGRATION.md](./DATABASE_MIGRATION.md) - 数据库迁移详细指南
- [README.md](./README.md) - 项目概述和基础信息

## 🚀 快速启动（3分钟）

### 方法 1: 使用 Coze CLI（最简单）

```bash
# 启动开发服务器
coze dev
```

访问 http://localhost:5000

### 方法 2: 使用 Docker + 快速启动脚本

```bash
# 1. 启动 PostgreSQL 数据库
docker-compose -f docker-compose.dev.yml up -d

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，设置 DATABASE_URL 和 JWT_SECRET

# 3. 启动开发环境（自动安装依赖、应用迁移、启动服务）
./scripts/start-dev.sh
```

访问 http://localhost:5000

### 方法 3: 手动启动

```bash
# 1. 安装依赖
pnpm install

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 文件

# 3. 应用数据库迁移
pnpm run db:push

# 4. 启动开发服务器
pnpm run dev
```

访问 http://localhost:5000

## 🔍 环境检查

运行环境检查脚本，验证配置是否正确：

```bash
./scripts/check-env.sh
```

脚本会检查：
- ✅ Node.js 版本
- ✅ pnpm 版本
- ✅ 项目文件完整性
- ✅ 依赖安装状态
- ✅ 环境变量配置
- ✅ 数据库连接状态

## 📦 新增文件

### 配置文件

- `.env.example` - 环境变量模板（复制并重命名为 `.env` 使用）
- `docker-compose.dev.yml` - Docker Compose 配置，用于快速启动 PostgreSQL

### 文档

- `LOCAL_DEPLOYMENT_GUIDE.md` - 详细的本地开发与部署指南（9.9KB）

### 脚本

- `scripts/start-dev.sh` - 一键启动开发环境脚本
- `scripts/check-env.sh` - 环境配置检查脚本

## 🔑 环境变量配置

必需配置：

```env
# 数据库连接
DATABASE_URL=postgresql://username:password@localhost:5432/aicollaboration

# JWT 密钥（生成方法：node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"）
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

可选配置：

```env
# JWT 过期时间
JWT_ACCESS_TOKEN_EXPIRES_IN=86400
JWT_REFRESH_TOKEN_EXPIRES_IN=604800

# 应用配置
PORT=15000
NODE_ENV=development
APP_URL=http://localhost:5000
```

## 🗄️ 数据库配置

### 使用本地 PostgreSQL

```bash
# 创建数据库
createdb aicollaboration
```

### 使用 Docker

```bash
# 启动 PostgreSQL
docker-compose -f docker-compose.dev.yml up -d

# 停止 PostgreSQL
docker-compose -f docker-compose.dev.yml down

# 查看日志
docker-compose -f docker-compose.dev.yml logs -f
```

### 应用迁移

```bash
# 方法 1: 直接推送（推荐开发环境）
pnpm run db:push

# 方法 2: 使用迁移脚本
bash ./scripts/apply-migration.sh

# 方法 3: 使用 API
curl -X POST http://localhost:5000/api/migrate \
  -H "Authorization: Bearer <你的管理员Token>"
```

### 数据库可视化管理

```bash
# 启动 Drizzle Studio
pnpm run db:studio

# 访问 http://localhost:4983
```

## 🛠️ 常用命令

### 开发

```bash
pnpm run dev              # 启动开发服务器
pnpm run build            # 构建生产版本
pnpm start                # 启动生产服务器
pnpm run lint             # 代码检查
pnpm run ts-check         # TypeScript 类型检查
```

### 数据库

```bash
pnpm run db:generate      # 生成迁移文件
pnpm run db:push          # 推送数据库变更
pnpm run db:studio        # 启动数据库可视化管理
```

### 脚本

```bash
./scripts/check-env.sh    # 检查环境配置
./scripts/start-dev.sh    # 一键启动开发环境
```

## 📂 项目结构

```
.
├── .env.example              # 环境变量模板
├── .coze                     # Coze CLI 配置
├── docker-compose.dev.yml    # Docker Compose 配置
├── LOCAL_DEPLOYMENT_GUIDE.md # 部署指南
├── DATABASE_MIGRATION.md     # 数据库迁移指南
├── README.md                 # 项目说明
├── scripts/
│   ├── check-env.sh          # 环境检查脚本
│   ├── start-dev.sh          # 快速启动脚本
│   ├── dev.sh                # 开发服务器启动
│   ├── build.sh              # 生产构建
│   └── start.sh              # 生产启动
└── src/                      # 源代码
    ├── app/                  # Next.js 页面
    ├── components/           # React 组件
    ├── lib/                  # 工具库
    ├── contexts/             # Context
    ├── storage/              # 数据存储
    └── types/                # TypeScript 类型
```

## ❓ 常见问题

### 1. 端口 5000 被占用

```bash
# 查找占用端口的进程
lsof -i :5000

# 终止进程
kill -9 <PID>

# 或修改 .env 中的 PORT
PORT=3001 pnpm run dev
```

### 2. 数据库连接失败

```bash
# 检查 PostgreSQL 是否运行
docker-compose -f docker-compose.dev.yml ps

# 查看 PostgreSQL 日志
docker-compose -f docker-compose.dev.yml logs postgres

# 重启 PostgreSQL
docker-compose -f docker-compose.dev.yml restart postgres
```

### 3. JWT Token 验证失败

```bash
# 检查 .env 中的 JWT_SECRET
cat .env | grep JWT_SECRET

# 生成新的 JWT 密钥
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. 迁移失败

```bash
# 强制同步 Schema（⚠️ 可能导致数据丢失）
pnpm run db:push
```

## 📞 获取帮助

1. 查看 [LOCAL_DEPLOYMENT_GUIDE.md](./LOCAL_DEPLOYMENT_GUIDE.md) - 详细文档
2. 运行 `./scripts/check-env.sh` - 检查环境配置
3. 查看浏览器控制台 - 获取前端错误信息
4. 查看服务器日志 - 获取后端错误信息

## 🎯 下一步

1. ✅ 运行 `./scripts/check-env.sh` 检查环境
2. ✅ 配置 `.env` 文件
3. ✅ 启动数据库（Docker 或本地）
4. ✅ 应用数据库迁移
5. ✅ 启动开发服务器
6. ✅ 访问 http://localhost:5000
7. ✅ 开始开发！

---

**祝你开发顺利！** 🚀
