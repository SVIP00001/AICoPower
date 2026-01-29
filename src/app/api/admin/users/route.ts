import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { users, sessions } from '@/storage/database/shared/schema';
import { sql, desc, and, or, like, eq, gt, count } from 'drizzle-orm';
import { verifyAccessToken } from '@/lib/jwt';

/**
 * 获取用户列表（支持筛选、分页）
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
    const status = searchParams.get('status') || '';
    const role = searchParams.get('role') || '';
    const keyword = searchParams.get('keyword') || '';

    // 验证分页参数
    if (page < 1 || pageSize < 1 || pageSize > 100) {
      return NextResponse.json(
        { success: false, message: '分页参数无效' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 构建筛选条件
    const conditions = [];
    
    if (status && status !== 'all') {
      conditions.push(eq(users.status, status));
    }

    if (role && role !== 'all') {
      conditions.push(eq(users.role, role));
    }

    if (keyword) {
      conditions.push(
        or(
          like(users.username, `%${keyword}%`),
          like(users.email, `%${keyword}%`),
          like(users.nickname, `%${keyword}%`)
        )!
      );
    }

    // 获取总数
    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;
    const [totalCount] = await db
      .select({ count: count() })
      .from(users)
      .where(whereCondition);

    const total = totalCount?.count || 0;

    // 计算分页
    const offset = (page - 1) * pageSize;
    const totalPages = Math.ceil(total / pageSize);

    // 获取用户列表
    const userList = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        phone: users.phone,
        nickname: users.nickname,
        avatar: users.avatar,
        role: users.role,
        status: users.status,
        emailVerified: users.emailVerified,
        phoneVerified: users.phoneVerified,
        twoFactorEnabled: users.twoFactorEnabled,
        taskCount: users.taskCount,
        loginCount: users.loginCount,
        createdAt: users.createdAt,
        lastLoginAt: users.lastLoginAt,
        lastLoginIp: users.lastLoginIp,
      })
      .from(users)
      .where(whereCondition)
      .orderBy(desc(users.createdAt))
      .limit(pageSize)
      .offset(offset);

    // 判断每个用户的在线状态（查询是否有未过期且未吊销的会话）
    const onlineUserIds: string[] = [];
    for (const user of userList) {
      const [sessionCount] = await db
        .select({ count: count() })
        .from(sessions)
        .where(
          and(
            eq(sessions.userId, user.id),
            eq(sessions.revoked, false),
            gt(sessions.expiresAt, new Date())
          )
        );

      if (sessionCount?.count && sessionCount.count > 0) {
        onlineUserIds.push(user.id);
      }
    }

    // 转换数据格式
    const formattedUsers = userList.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      nickname: user.nickname,
      avatar: user.avatar,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      taskCount: user.taskCount,
      loginCount: user.loginCount,
      createdAt: user.createdAt?.toISOString(),
      lastLoginAt: user.lastLoginAt?.toISOString() || null,
      lastLoginIp: user.lastLoginIp || null,
      isOnline: onlineUserIds.includes(user.id),
    }));

    return NextResponse.json({
      success: true,
      data: {
        users: formattedUsers,
        pagination: {
          page,
          pageSize,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    return NextResponse.json(
      { success: false, message: '获取用户列表失败' },
      { status: 500 }
    );
  }
}
