import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, extractTokenFromHeader } from '@/lib/jwt';
import { authManager } from '@/storage/database';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { success: false, message: '未提供认证令牌' },
        { status: 401 }
      );
    }

    // 验证令牌
    const payload = verifyAccessToken(token);
    const { sessionId } = payload;

    // 撤销会话
    await authManager.revokeSession(sessionId);

    // 获取客户端信息
    const userAgent = request.headers.get('user-agent') || '';
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';

    // 创建审计日志（使用 userId 作为 resourceId，因为 sessionId 可能超过36字符）
    await authManager.createAuditLog({
      userId: payload.userId,
      action: 'logout',
      resource: 'session',
      resourceId: payload.userId,
      details: { sessionId },
      ip,
      userAgent,
      result: 'success',
    });

    return NextResponse.json(
      { success: true, message: '登出成功' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : '登出失败',
      },
      { status: 401 }
    );
  }
}
