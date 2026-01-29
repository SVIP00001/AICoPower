# projects

这是一个基于 [Next.js 16](https://nextjs.org) + [shadcn/ui](https://ui.shadcn.com) 的全栈应用项目，由扣子编程 CLI 创建。

## 项目概述

全球开放AI协同攻坚与价值分配平台，支持100亿用户级架构。用户可注册为统一角色，自由发布任务或接入AI，多AI协同解决问题，并根据贡献度分配收益。

### 核心功能

1. **用户管理**
   - 统一用户角色：所有用户同时具备发布任务和接入AI的权限
   - 简化权限模型：普通用户拥有完整的任务和AI管理权限
   - JWT身份认证与安全机制

2. **AI管理**
   - AI注册与档案管理
   - AI查询与搜索
   - 智能标签识别与推荐
   - 资格认证申请与审核
   - 测试问题管理与记录
   - 等级评定与评估（初级 → 中级 → 高级 → 顶尖）
   - 协作任务管理

3. **商家中心**
   - AI列表展示与统计
   - AI发布表单
   - 标签推荐（基于描述自动识别）
   - 定价配置（按次收费、按算力收费、按时长收费、自定义定价）
   - 收益数据分析

### 技术栈

- **前端框架**: Next.js 16 (App Router)
- **UI组件**: React 19 + shadcn/ui (基于 Radix UI)
- **样式**: Tailwind CSS 4
- **数据库**: PostgreSQL
- **ORM**: Drizzle ORM
- **认证**: JWT (jsonwebtoken) + bcryptjs
- **语言**: TypeScript 5

## 快速开始

### 前置要求

- Node.js 24+
- pnpm 9.0+
- PostgreSQL 14+

### 本地开发（详细指南）

详细的本地开发和部署指南，请查看 [LOCAL_DEPLOYMENT_GUIDE.md](./LOCAL_DEPLOYMENT_GUIDE.md)

### 快速启动

#### 方法 1: 使用 Coze CLI（推荐）

```bash
# 启动开发服务器
coze dev
```

#### 方法 2: 使用脚本一键启动

```bash
# 启动 PostgreSQL 数据库（使用 Docker）
docker-compose -f docker-compose.dev.yml up -d

# 使用快速启动脚本
./scripts/start-dev.sh
```

#### 方法 3: 手动启动

```bash
# 1. 安装依赖
pnpm install

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，配置数据库连接和 JWT 密钥

# 3. 应用数据库迁移
pnpm run db:push

# 4. 启动开发服务器
pnpm run dev
```

### 访问应用

启动后，在浏览器中打开 [http://localhost:5000](http://localhost:5000) 查看应用。

开发服务器支持热更新，修改代码后页面会自动刷新。

### 构建生产版本

```bash
coze build
```

### 启动生产服务器

```bash
coze start
```

## 数据库Schema

### 用户相关表

- **users**: 用户表，存储用户基本信息
- **sessions**: 会话表，存储JWT token信息
- **login_history**: 登录历史记录表
- **audit_logs**: 安全审计日志表

### AI相关表

- **ai_profiles**: AI档案表（核心表）
  - 存储AI的基本信息、能力标签、等级认证
  - 包含测试分数、任务统计、收益数据
  - 支持多种定价模式

- **ai_merchant_credentials**: 商家AI资质备案表
  - 存储商家的营业执照、合规报告
  - 支持审核流程

- **ai_test_questions**: AI测试问题库表
  - 存储测试问题与答案
  - 支持多种问题类型

- **ai_test_records**: AI测试记录表
  - 存储测试结果与评分
  - 记录测试历史

- **ai_collaboration_tasks**: AI协作任务表
  - 存储协作任务信息
  - 记录任务状态与结果

### 数据库迁移

```bash
# 创建AI相关表
node scripts/create-ai-tables.js

# 或使用Drizzle Kit
pnpm run db:push
```

## API路由

### AI管理API

- `POST /api/ai/register` - 注册AI
- `GET /api/ai/[id]` - 获取AI详情
- `GET /api/ai/search` - 搜索AI
- `POST /api/ai/identify-tags` - 识别推荐标签
- `POST /api/ai/qualification` - 申请资格认证
- `POST /api/ai/qualification/[id]/review` - 审核资格认证
- `POST /api/ai/test-questions` - 创建测试问题
- `GET /api/ai/test-records` - 获取测试记录
- `POST /api/ai/level/[id]` - 评定AI等级
- `POST /api/ai/level/evaluate-all` - 评估所有AI等级
- `POST /api/ai/collaboration/tasks` - 创建协作任务
- `POST /api/ai/collaboration/tasks/[taskId]/submit/[aiId]` - 提交任务结果
- `POST /api/ai/collaboration/tasks/[taskId]/integrate` - 集成任务结果

### 认证API

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出
- `POST /api/auth/refresh` - 刷新token
- `POST /api/auth/verify` - 验证token

## 开发指南

### 本地开发

1. **安装依赖**
   ```bash
   pnpm install
   ```

2. **配置环境变量**
   ```bash
   cp .env.example .env
   # 编辑.env文件，配置数据库连接等信息
   ```

3. **初始化数据库**
   ```bash
   # 创建AI相关表
   node scripts/create-ai-tables.js
   ```

4. **启动开发服务器**
   ```bash
   coze dev
   ```

   服务启动后，在浏览器中打开 [http://localhost:5000](http://localhost:5000) 查看应用。

### 发布AI功能使用

1. **登录系统**
   - 访问登录页面
   - 输入用户名和密码进行登录

2. **访问商家中心**
   - 登录后访问 `/merchant` 页面
   - 点击"发布新AI"按钮

3. **填写AI信息**
   - AI名称：必填
   - AI类型：选择AI类型（通用大模型、垂直领域AI等）
   - AI描述：必填，详细描述AI的功能和特点
   - 能力标签：系统会根据描述自动推荐标签，也可以手动添加
   - 定价信息：可选，配置定价模式和费率

4. **提交发布**
   - 点击"发布AI"按钮
   - 系统会创建AI档案并保存到数据库

5. **查看和管理AI**
   - 在"我的AI"标签页查看已发布的AI
   - 查看统计数据（完成任务数、总收益、测试分数等）

### 故障排查

#### 问题：点击发布AI按钮没有反应

**可能原因**：
1. 未登录或token已过期
2. 浏览器JavaScript错误
3. 按钮被禁用（未填写必填字段）

**解决方案**：
1. 检查浏览器控制台是否有错误信息
2. 确保已登录且token有效
3. 填写所有必填字段（AI名称和描述）

#### 问题：数据库表不存在

**错误信息**：
```
relation "ai_profiles" does not exist
```

**解决方案**：
```bash
node scripts/create-ai-tables.js
```

#### 问题：端口5000已被占用

**解决方案**：
```bash
# 查找占用5000端口的进程
lsof -i:5000

# 杀死进程
kill -9 <PID>

# 重新启动服务
coze dev
```

#### 问题：TypeScript编译错误

**解决方案**：
```bash
# 运行类型检查
npx tsc --noEmit

# 查看具体错误信息并修复
```

### 日志查看

项目日志位于 `/app/work/logs/bypass/` 目录：
- `app.log` - 主流程日志
- `dev.log` - 开发调试日志
- `console.log` - 浏览器控制台日志

```bash
# 查看最新日志
tail -n 20 /app/work/logs/bypass/app.log

# 搜索错误信息
grep -nE "Error|Exception" /app/work/logs/bypass/app.log
```

## 项目结构

```
src/
├── app/                      # Next.js App Router 目录
│   ├── layout.tsx           # 根布局组件
│   ├── page.tsx             # 首页
│   ├── globals.css          # 全局样式（包含 shadcn 主题变量）
│   └── [route]/             # 其他路由页面
├── components/              # React 组件目录
│   └── ui/                  # shadcn/ui 基础组件（优先使用）
│       ├── button.tsx
│       ├── card.tsx
│       └── ...
├── lib/                     # 工具函数库
│   └── utils.ts            # cn() 等工具函数
└── hooks/                   # 自定义 React Hooks（可选）
```

## 核心开发规范

### 1. 组件开发

**优先使用 shadcn/ui 基础组件**

本项目已预装完整的 shadcn/ui 组件库，位于 `src/components/ui/` 目录。开发时应优先使用这些组件作为基础：

```tsx
// ✅ 推荐：使用 shadcn 基础组件
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function MyComponent() {
  return (
    <Card>
      <CardHeader>标题</CardHeader>
      <CardContent>
        <Input placeholder="输入内容" />
        <Button>提交</Button>
      </CardContent>
    </Card>
  );
}
```

**可用的 shadcn 组件清单**

- 表单：`button`, `input`, `textarea`, `select`, `checkbox`, `radio-group`, `switch`, `slider`
- 布局：`card`, `separator`, `tabs`, `accordion`, `collapsible`, `scroll-area`
- 反馈：`alert`, `alert-dialog`, `dialog`, `toast`, `sonner`, `progress`
- 导航：`dropdown-menu`, `menubar`, `navigation-menu`, `context-menu`
- 数据展示：`table`, `avatar`, `badge`, `hover-card`, `tooltip`, `popover`
- 其他：`calendar`, `command`, `carousel`, `resizable`, `sidebar`

详见 `src/components/ui/` 目录下的具体组件实现。

### 2. 路由开发

Next.js 使用文件系统路由，在 `src/app/` 目录下创建文件夹即可添加路由：

```bash
# 创建新路由 /about
src/app/about/page.tsx

# 创建动态路由 /posts/[id]
src/app/posts/[id]/page.tsx

# 创建路由组（不影响 URL）
src/app/(marketing)/about/page.tsx

# 创建 API 路由
src/app/api/users/route.ts
```

**页面组件示例**

```tsx
// src/app/about/page.tsx
import { Button } from '@/components/ui/button';

export const metadata = {
  title: '关于我们',
  description: '关于页面描述',
};

export default function AboutPage() {
  return (
    <div>
      <h1>关于我们</h1>
      <Button>了解更多</Button>
    </div>
  );
}
```

**动态路由示例**

```tsx
// src/app/posts/[id]/page.tsx
export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <div>文章 ID: {id}</div>;
}
```

**API 路由示例**

```tsx
// src/app/api/users/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ users: [] });
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ success: true });
}
```

### 3. 依赖管理

**必须使用 pnpm 管理依赖**

```bash
# ✅ 安装依赖
pnpm install

# ✅ 添加新依赖
pnpm add package-name

# ✅ 添加开发依赖
pnpm add -D package-name

# ❌ 禁止使用 npm 或 yarn
# npm install  # 错误！
# yarn add     # 错误！
```

项目已配置 `preinstall` 脚本，使用其他包管理器会报错。

### 4. 样式开发

**使用 Tailwind CSS v4**

本项目使用 Tailwind CSS v4 进行样式开发，并已配置 shadcn 主题变量。

```tsx
// 使用 Tailwind 类名
<div className="flex items-center gap-4 p-4 rounded-lg bg-background">
  <Button className="bg-primary text-primary-foreground">
    主要按钮
  </Button>
</div>

// 使用 cn() 工具函数合并类名
import { cn } from '@/lib/utils';

<div className={cn(
  "base-class",
  condition && "conditional-class",
  className
)}>
  内容
</div>
```

**主题变量**

主题变量定义在 `src/app/globals.css` 中，支持亮色/暗色模式：

- `--background`, `--foreground`
- `--primary`, `--primary-foreground`
- `--secondary`, `--secondary-foreground`
- `--muted`, `--muted-foreground`
- `--accent`, `--accent-foreground`
- `--destructive`, `--destructive-foreground`
- `--border`, `--input`, `--ring`

### 5. 表单开发

推荐使用 `react-hook-form` + `zod` 进行表单开发：

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  username: z.string().min(2, '用户名至少 2 个字符'),
  email: z.string().email('请输入有效的邮箱'),
});

export default function MyForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { username: '', email: '' },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Input {...form.register('username')} />
      <Input {...form.register('email')} />
      <Button type="submit">提交</Button>
    </form>
  );
}
```

### 6. 数据获取

**服务端组件（推荐）**

```tsx
// src/app/posts/page.tsx
async function getPosts() {
  const res = await fetch('https://api.example.com/posts', {
    cache: 'no-store', // 或 'force-cache'
  });
  return res.json();
}

export default async function PostsPage() {
  const posts = await getPosts();

  return (
    <div>
      {posts.map(post => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  );
}
```

**客户端组件**

```tsx
'use client';

import { useEffect, useState } from 'react';

export default function ClientComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setData);
  }, []);

  return <div>{JSON.stringify(data)}</div>;
}
```

## 常见开发场景

### 添加新页面

1. 在 `src/app/` 下创建文件夹和 `page.tsx`
2. 使用 shadcn 组件构建 UI
3. 根据需要添加 `layout.tsx` 和 `loading.tsx`

### 创建业务组件

1. 在 `src/components/` 下创建组件文件（非 UI 组件）
2. 优先组合使用 `src/components/ui/` 中的基础组件
3. 使用 TypeScript 定义 Props 类型

### 添加全局状态

推荐使用 React Context 或 Zustand：

```tsx
// src/lib/store.ts
import { create } from 'zustand';

interface Store {
  count: number;
  increment: () => void;
}

export const useStore = create<Store>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));
```

### 集成数据库

推荐使用 Prisma 或 Drizzle ORM，在 `src/lib/db.ts` 中配置。

## 技术栈

- **框架**: Next.js 16.1.1 (App Router)
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **样式**: Tailwind CSS v4
- **表单**: React Hook Form + Zod
- **图标**: Lucide React
- **字体**: Geist Sans & Geist Mono
- **包管理器**: pnpm 9+
- **TypeScript**: 5.x

## 参考文档

- [Next.js 官方文档](https://nextjs.org/docs)
- [shadcn/ui 组件文档](https://ui.shadcn.com)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [React Hook Form](https://react-hook-form.com)

## 重要提示

1. **必须使用 pnpm** 作为包管理器
2. **优先使用 shadcn/ui 组件** 而不是从零开发基础组件
3. **遵循 Next.js App Router 规范**，正确区分服务端/客户端组件
4. **使用 TypeScript** 进行类型安全开发
5. **使用 `@/` 路径别名** 导入模块（已配置）
