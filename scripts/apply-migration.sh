#!/bin/bash

# 应用数据库迁移
# 注意：实际应用迁移需要根据数据库连接和迁移文件执行
# 这里提供两种方式：
# 1. 使用drizzle-kit推送（开发环境）
# 2. 使用drizzle-kit迁移（生产环境）

# 方式1：直接推送（推荐用于开发环境）
echo "推送数据库变更到数据库..."
npx drizzle-kit push:pg

echo "数据库变更已推送！"

# 方式2：使用迁移文件（生产环境）
# echo "应用迁移文件..."
# npx drizzle-kit migrate
