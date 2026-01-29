import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken, generateTokenPair } from '@/lib/jwt';
import { authManager } from '@/storage/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: '未提供刷新令牌' },
        { status: 400 }
      );
    }

    // 验证刷新令牌
    const payload = verifyRefreshToken(refreshToken);

    // 获取会话
    const session = await authManager.getSessionByRefreshToken(refreshToken);

    if (!session) {
      return NextResponse.json(
        { success: false, message: '会话不存在或已失效' },
        { status: 401 }
      );
    }

    if (session.revoked) {
      return NextResponse.json(
        { success: false, message: '会话已被撤销' },
        { status: 401 }
      );
    }

    // 检查刷新令牌是否过期
    if (session.refreshTokenExpiresAt && new Date(session.refreshTokenExpiresAt) < new Date()) {
      return NextResponse.json(
        { success: false, message: '刷新令牌已过期，请重新登录' },
        { status: 401 }
      );
    }

    // 生成新的令牌对
    const tokenPair = generateTokenPair({
      userId: payload.userId,
      sessionId: payload.sessionId,
      role: payload.role,
      shardId: payload.shardId,
    });

    // 获取客户端信息
    const userAgent = request.headers.get('user-agent') || '';
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';

    // 撤销旧会话
    await authManager.revokeSession(payload.sessionId);

    // 创建新会话
    await authManager.createSession({
      sessionId: tokenPair.accessToken, // 使用新的会话ID
      userId: payload.userId,
      token: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      deviceInfo: {
        userAgent,
        ip,
      },
      ip,
      userAgent,
      expiresAt: tokenPair.expiresAt,
      refreshTokenExpiresAt: tokenPair.refreshTokenExpiresAt,
    });

    // 创建审计日志
    await authManager.createAuditLog({
      userId: payload.userId,
      action: 'refresh_token',
      resource: 'session',
      resourceId: payload.sessionId,
      details: { oldSessionId: payload.sessionId },
      ip,
      userAgent,
      result: 'success',
    });

    return NextResponse.json(
      {
        success: true,
        message: '令牌刷新成功',
        data: {
          tokens: {
            accessToken: tokenPair.accessToken,
            refreshToken: tokenPair.refreshToken,
            expiresAt: tokenPair.expiresAt.toISOString(),
            refreshTokenExpiresAt: tokenPair.refreshTokenExpiresAt.toISOString(),
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : '令牌刷新失败',
      },
      { status: 401 }
    );
  }
}
