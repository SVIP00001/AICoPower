#!/bin/bash

# 生成数据库迁移文件
npx drizzle-kit generate:pg

echo "迁移文件已生成到 src/storage/database/drizzle/"
