import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { users, sessions, aiProfiles } from '@/storage/database/shared/schema';
import { eq, and, gt, count, sql } from 'drizzle-orm';
import { verifyAccessToken } from '@/lib/jwt';

/**
 * 获取用户详情（包含AI数量、任务数量）
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
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

    const { userId } = await params;

    const db = await getDb();

    // 获取用户基本信息
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      return NextResponse.json(
        { success: false, message: '用户不存在' },
        { status: 404 }
      );
    }

    // 判断在线状态
    const [sessionCount] = await db
      .select({ count: count() })
      .from(sessions)
      .where(
        and(
          eq(sessions.userId, userId),
          eq(sessions.revoked, false),
          gt(sessions.expiresAt, new Date())
        )
      );

    const isOnline = sessionCount?.count && sessionCount.count > 0;

    // 获取AI数量
    const [aiCountResult] = await db
      .select({ count: count() })
      .from(aiProfiles)
      .where(eq(aiProfiles.userId, userId));

    const aiCount = aiCountResult?.count || 0;

    // 获取任务数量
    const taskCount = user.taskCount || 0;

    // 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      data: {
        user: {
          ...userWithoutPassword,
          createdAt: user.createdAt?.toISOString(),
          lastLoginAt: user.lastLoginAt?.toISOString() || null,
          updatedAt: user.updatedAt?.toISOString() || null,
          isOnline,
          aiCount,
          taskCount,
        },
      },
    });
  } catch (error) {
    console.error('获取用户详情失败:', error);
    return NextResponse.json(
      { success: false, message: '获取用户详情失败' },
      { status: 500 }
    );
  }
}
