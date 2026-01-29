import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { users, sessions, auditLogs } from '@/storage/database/shared/schema';
import { eq, and, ne } from 'drizzle-orm';
import { verifyAccessToken } from '@/lib/jwt';
import { getClientInfo } from '@/lib/clientInfo';

/**
 * 强退用户（吊销所有会话）
 */
export async function POST(
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
    const body = await request.json();
    const { sessionId } = body || {}; // 可选参数，指定吊销某个会话，如果不传则吊销所有会话

    const db = await getDb();

    // 检查用户是否存在
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: '用户不存在' },
        { status: 404 }
      );
    }

    // 防止管理员强退自己
    if (userId === payload.userId && !sessionId) {
      return NextResponse.json(
        { success: false, message: '不能强退自己' },
        { status: 400 }
      );
    }

    // 防止普通管理员强退超级管理员
    if (payload.role === 'admin' && existingUser.role === 'super_admin') {
      return NextResponse.json(
        { success: false, message: '不能强退超级管理员' },
        { status: 403 }
      );
    }

    let revokedCount = 0;

    if (sessionId) {
      // 吊销指定会话
      const [updated] = await db
        .update(sessions)
        .set({ revoked: true })
        .where(
          and(
            eq(sessions.userId, userId),
            eq(sessions.sessionId, sessionId),
            eq(sessions.revoked, false)
          )
        )
        .returning();

      revokedCount = updated ? 1 : 0;
    } else {
      // 吊销所有会话
      const updated = await db
        .update(sessions)
        .set({ revoked: true })
        .where(
          and(
            eq(sessions.userId, userId),
            eq(sessions.revoked, false)
          )
        )
        .returning();

      revokedCount = updated.length;
    }

    // 获取客户端信息
    const { ip, userAgent } = getClientInfo(request);

    // 创建审计日志
    await db.insert(auditLogs).values({
      userId: payload.userId,
      action: 'force_logout_user',
      resource: 'user',
      resourceId: userId,
      details: {
        targetUser: existingUser.username,
        sessionId: sessionId || 'all',
        revokedCount,
      },
      ip,
      userAgent,
      result: 'success',
    });

    return NextResponse.json({
      success: true,
      message: sessionId
        ? '指定会话已强制下线'
        : `用户已强制下线，共吊销 ${revokedCount} 个会话`,
      data: {
        revokedCount,
      },
    });
  } catch (error) {
    console.error('强退用户失败:', error);
    return NextResponse.json(
      { success: false, message: '强退用户失败' },
      { status: 500 }
    );
  }
}
