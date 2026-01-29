import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { users, loginHistory } from '@/storage/database/shared/schema';
import { sql, and, gte, eq } from 'drizzle-orm';
import { verifyAccessToken } from '@/lib/jwt';

/**
 * 获取平台统计数据（仅管理员可访问）
 */
export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: '未授权访问' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);

    if (!payload) {
      return NextResponse.json({ success: false, message: 'Token 无效' }, { status: 401 });
    }

    if (payload.role !== 'super_admin' && payload.role !== 'admin') {
      return NextResponse.json({ success: false, message: '权限不足' }, { status: 403 });
    }

    const db = await getDb();

    // 1. 总用户数（不限制状态，统计所有用户）
    const totalUsersAllResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users);
    const totalUsersAll = totalUsersAllResult[0]?.count || 0;

    // 活跃用户数（所有status为active的用户）
    const activeUsersStatusResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(eq(users.status, 'active'));
    const activeUsersStatus = activeUsersStatusResult[0]?.count || 0;

    // 2. 最近7天登录过的唯一用户数
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // 先查询7天内所有登录记录数
    const recentLoginCountResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(loginHistory)
      .where(gte(loginHistory.loginTime, sevenDaysAgo));
    const recentLoginCount = recentLoginCountResult[0]?.count || 0;

    // 查询7天内成功的唯一用户数
    const activeUsersResult = await db
      .select({ count: sql<number>`count(DISTINCT user_id)::int` })
      .from(loginHistory)
      .where(
        and(
          gte(loginHistory.loginTime, sevenDaysAgo),
          eq(loginHistory.status, 'success')
        )
      );
    
    const activeUsers = activeUsersResult[0]?.count || 0;

    // 3. 接入 AI 数量（暂时返回 0，等 AI 模块实现后更新）
    const totalAIs = 0;

    // 4. 总任务数（暂时返回 0，等任务模块实现后更新）
    const totalTasks = 0;

    // 5. 系统状态
    const systemStatus = {
      api: '正常',
      database: '正常',
      storage: '正常',
      ai: '正常',
    };

    // 6. 用户增长数据（最近30天）
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const userGrowthResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(gte(users.createdAt, thirtyDaysAgo));
    const userGrowth = userGrowthResult[0]?.count || 0;

    // 调试日志
    console.log('统计数据调试信息:', {
      totalUsersAll,
      activeUsersStatus,
      recentLoginCount,
      activeUsers,
      userGrowth
    });

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalUsers: totalUsersAll, // 使用总用户数
          activeUsers: activeUsersStatus > 0 ? activeUsersStatus : activeUsers, // 优先显示活跃状态用户，如果没有则显示7天登录用户
          totalAIs,
          totalTasks,
        },
        systemStatus,
        userGrowth,
      },
    });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    return NextResponse.json(
      { success: false, message: '获取统计数据失败' },
      { status: 500 }
    );
  }
}
