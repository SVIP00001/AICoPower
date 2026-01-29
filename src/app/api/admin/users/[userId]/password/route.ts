import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { users, auditLogs } from '@/storage/database/shared/schema';
import { eq, and } from 'drizzle-orm';
import { verifyAccessToken } from '@/lib/jwt';
import { hashPassword } from '@/lib/password';
import { getClientInfo } from '@/lib/clientInfo';

/**
 * 重置用户密码
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

    // 验证新密码
    let newPassword;
    if (body.newPassword) {
      if (body.newPassword.length < 6) {
        return NextResponse.json(
          { success: false, message: '新密码长度不能少于6位' },
          { status: 400 }
        );
      }
      newPassword = body.newPassword;
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

    // 如果没有提供新密码，生成默认密码：用户名 + 123456
    if (!newPassword) {
      newPassword = `${existingUser.username}123456`;
    }

    // 防止管理员重置超级管理员密码
    if (payload.role === 'admin' && existingUser.role === 'super_admin') {
      return NextResponse.json(
        { success: false, message: '不能重置超级管理员密码' },
        { status: 403 }
      );
    }

    // 哈希新密码
    const hashedPassword = await hashPassword(newPassword);

    // 更新密码
    await db
      .update(users)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    // 获取客户端信息
    const { ip, userAgent } = getClientInfo(request);

    // 创建审计日志
    await db.insert(auditLogs).values({
      userId: payload.userId,
      action: 'reset_user_password',
      resource: 'user',
      resourceId: userId,
      details: {
        targetUser: existingUser.username,
      },
      ip,
      userAgent,
      result: 'success',
    });

    return NextResponse.json({
      success: true,
      message: '密码已重置成功',
      data: {
        newPassword, // 生产环境应该通过邮件或短信发送，这里仅用于演示
      },
    });
  } catch (error) {
    console.error('重置用户密码失败:', error);
    return NextResponse.json(
      { success: false, message: '重置用户密码失败' },
      { status: 500 }
    );
  }
}
