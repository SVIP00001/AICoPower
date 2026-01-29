import { migrate } from "drizzle-orm/postgres-js/migrator";
import { getDb } from "coze-coding-dev-sdk";
import * as path from "path";

/**
 * 应用数据库迁移
 * 
 * 使用方法：
 * 1. 在应用启动时调用此函数（推荐）
 * 2. 通过API路由触发（如 /api/migrate）
 * 
 * @returns 返回迁移结果
 */
export async function applyMigration() {
  try {
    const db = await getDb();
    
    // 应用迁移
    await migrate(db, {
      migrationsFolder: path.join(process.cwd(), "src/storage/database/drizzle"),
    });
    
    console.log("✅ 数据库迁移成功！");
    return { success: true, message: "数据库迁移成功" };
  } catch (error) {
    console.error("❌ 数据库迁移失败：", error);
    throw error;
  }
}

/**
 * 获取迁移状态（可选）
 * 用于检查是否有待应用的迁移
 */
export async function getMigrationStatus() {
  // 这里可以实现检查迁移状态的逻辑
  // 目前 drizzle-kit 没有直接提供查询迁移状态的API
  // 可以通过查询数据库中的迁移记录表来获取
  return { 
    message: "迁移状态查询功能待实现",
    note: "可以通过检查 drizzle_schema_version 表获取迁移历史" 
  };
}
