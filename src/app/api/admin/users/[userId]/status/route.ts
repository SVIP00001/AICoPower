import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { users, auditLogs } from '@/storage/database/shared/schema';
import { eq, and } from 'drizzle-orm';
import { verifyAccessToken } from '@/lib/jwt';
import { getClientInfo } from '@/lib/clientInfo';

/**
 * 更新用户状态（启用/禁用）
 */
export async function PUT(
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
    const { status } = body;

    // 验证状态值
    const validStatuses = ['active', 'inactive', 'suspended', 'banned'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: '无效的状态值' },
        { status: 400 }
      );
    }

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

    // 防止管理员禁用自己
    if (userId === payload.userId) {
      return NextResponse.json(
        { success: false, message: '不能修改自己的状态' },
        { status: 400 }
      );
    }

    // 防止普通管理员禁用超级管理员
    if (payload.role === 'admin' && existingUser.role === 'super_admin') {
      return NextResponse.json(
        { success: false, message: '不能禁用超级管理员' },
        { status: 403 }
      );
    }

    // 更新用户状态
    await db
      .update(users)
      .set({ status, updatedAt: new Date() })
      .where(eq(users.id, userId));

    // 获取客户端信息
    const { ip, userAgent } = getClientInfo(request);

    // 创建审计日志
    await db.insert(auditLogs).values({
      userId: payload.userId,
      action: 'update_user_status',
      resource: 'user',
      resourceId: userId,
      details: {
        oldStatus: existingUser.status,
        newStatus: status,
      },
      ip,
      userAgent,
      result: 'success',
    });

    return NextResponse.json({
      success: true,
      message: `用户状态已更新为${status}`,
    });
  } catch (error) {
    console.error('更新用户状态失败:', error);
    return NextResponse.json(
      { success: false, message: '更新用户状态失败' },
      { status: 500 }
    );
  }
}
