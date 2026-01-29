import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { users, sessions, loginHistory, auditLogs } from '@/storage/database/shared/schema';
import { eq, and } from 'drizzle-orm';
import { verifyAccessToken } from '@/lib/jwt';
import { getClientInfo } from '@/lib/clientInfo';

/**
 * 删除用户（管理员功能）
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

    // 防止删除自己
    if (userId === payload.userId) {
      return NextResponse.json(
        { success: false, message: '不能删除自己' },
        { status: 400 }
      );
    }

    // 防止普通管理员删除超级管理员
    if (payload.role === 'admin' && existingUser.role === 'super_admin') {
      return NextResponse.json(
        { success: false, message: '不能删除超级管理员' },
        { status: 403 }
      );
    }

    // 保存用户信息用于审计日志
    const userInfo = {
      id: existingUser.id,
      username: existingUser.username,
      email: existingUser.email,
      role: existingUser.role,
    };

    // 删除用户的相关数据（事务）
    await db.transaction(async (tx) => {
      // 1. 删除用户的会话
      await tx
        .delete(sessions)
        .where(eq(sessions.userId, userId));

      // 2. 删除用户的登录历史
      await tx
        .delete(loginHistory)
        .where(eq(loginHistory.userId, userId));

      // 3. 删除用户的审计日志
      await tx
        .delete(auditLogs)
        .where(eq(auditLogs.userId, userId));

      // 4. 删除用户
      await tx
        .delete(users)
        .where(eq(users.id, userId));
    });

    // 获取客户端信息
    const { ip, userAgent } = getClientInfo(request);

    // 创建审计日志
    await db.insert(auditLogs).values({
      userId: payload.userId,
      action: 'delete_user',
      resource: 'user',
      resourceId: payload.userId,
      details: {
        deletedUser: userInfo,
      },
      ip,
      userAgent,
      result: 'success',
    });

    return NextResponse.json({
      success: true,
      message: '用户已删除成功',
    });
  } catch (error) {
    console.error('删除用户失败:', error);
    return NextResponse.json(
      { success: false, message: '删除用户失败' },
      { status: 500 }
    );
  }
}
