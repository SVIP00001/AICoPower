const { getDb } = require('coze-coding-dev-sdk');
const { users, loginHistory } = require('./src/storage/database/shared/schema');

async function testDbQuery() {
  try {
    const db = await getDb();

    // 查询用户总数
    const userCountResult = await db
      .select({ count: require('drizzle-orm').sql`count(*)::int` })
      .from(users);
    console.log('用户总数:', userCountResult[0]?.count || 0);

    // 查询登录历史总数
    const loginCountResult = await db
      .select({ count: require('drizzle-orm').sql`count(*)::int` })
      .from(loginHistory);
    console.log('登录历史总数:', loginCountResult[0]?.count || 0);

    // 查看用户详情
    const allUsers = await db.select().from(users).limit(5);
    console.log('前5个用户:', allUsers);

    process.exit(0);
  } catch (error) {
    console.error('查询失败:', error);
    process.exit(1);
  }
}

testDbQuery();
