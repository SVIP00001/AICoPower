# 数据库迁移指南

本项目使用 Drizzle ORM 管理数据库Schema和迁移。

## 快速开始

### 1. 生成迁移文件

当你修改了数据库Schema（`src/storage/database/shared/schema.ts`）后，运行以下命令生成迁移文件：

```bash
npm run db:generate
```

或使用脚本：

```bash
bash ./scripts/generate-migration.sh
```

迁移文件将生成到 `src/storage/database/drizzle/` 目录。

### 2. 应用迁移到数据库

有两种方式应用迁移：

#### 方式1：直接推送（推荐用于开发环境）

```bash
npm run db:push
```

这会直接将Schema变更推送到数据库，无需迁移文件。

#### 方式2：通过API路由应用

```bash
curl -X POST http://localhost:5000/api/migrate \
  -H "Authorization: Bearer <你的管理员Token>"
```

#### 方式3：使用脚本应用

```bash
bash ./scripts/apply-migration.sh
```

## 数据库可视化管理

启动 Drizzle Studio 进行可视化管理：

```bash
npm run db:studio
```

这将启动一个Web界面（默认端口4983），可以查看和管理数据库数据。

## 工作流程

### 开发环境

1. 修改 `src/storage/database/shared/schema.ts`
2. 运行 `npm run db:generate` 生成迁移文件（可选）
3. 运行 `npm run db:push` 直接应用变更

### 生产环境

1. 修改 Schema
2. 运行 `npm run db:generate` 生成迁移文件
3. 将迁移文件提交到版本控制
4. 在生产服务器上运行迁移脚本或通过API触发迁移

## 迁移文件结构

```
src/storage/database/drizzle/
├── meta/
│   └── _journal.json          # 迁移元数据
└── <timestamp>_<name>.sql     # SQL迁移文件
```

## 注意事项

- ⚠️ 执行迁移前请备份数据库
- ⚠️ 生产环境迁移建议先在测试环境验证
- ⚠️ 删除字段的迁移会导致数据丢失
- ⚠️ 重命名字段需要先添加新字段再删除旧字段

## 当前Schema

当前数据库包含以下表：

### 用户相关
- `users` - 用户表
- `sessions` - 会话表
- `login_history` - 登录历史表
- `audit_logs` - 审计日志表

### AI接入相关
- `ai_profiles` - AI档案表
- `ai_qualifications` - 商家资质备案表
- `test_questions` - 测试题库表
- `test_records` - 测试记录表
- `collaborative_tasks` - 协同任务表
- `task_contributions` - 任务贡献表

## 故障排除

### 迁移失败

1. 检查数据库连接配置（`DATABASE_URL`）
2. 查看迁移文件SQL语法是否正确
3. 检查是否有表锁定

### Schema不匹配

如果数据库Schema与代码不一致，可以运行：

```bash
npm run db:push
```

这会强制同步Schema，⚠️ 可能会导致数据丢失，请谨慎使用。

## 相关文档

- [Drizzle ORM 文档](https://orm.drizzle.team/)
- [Drizzle Kit 文档](https://orm.drizzle.team/docs/kit-overview)
