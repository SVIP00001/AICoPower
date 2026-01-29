const { applyMigration } = require('../src/storage/database/migrate');

async function main() {
  try {
    console.log('开始数据库迁移...');
    const result = await applyMigration();
    console.log('迁移结果：', result);
    process.exit(0);
  } catch (error) {
    console.error('迁移失败：', error);
    process.exit(1);
  }
}

main();
