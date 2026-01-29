import { NextRequest, NextResponse } from 'next/server';
import { authManager } from '@/storage/database';
import { verifyPassword } from '@/lib/password';
import { generateTokenPair } from '@/lib/jwt';
import { getClientInfo, getLocationByIP } from '@/lib/clientInfo';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { emailOrPhone, password } = body;

    // 验证必填字段
    if (!emailOrPhone || !password) {
      return NextResponse.json(
        { success: false, message: '邮箱/手机号和密码不能为空' },
        { status: 400 }
      );
    }

    // 获取客户端信息
    const { ip, userAgent, deviceType } = getClientInfo(request);

    // 获取地理位置
    const location = await getLocationByIP(ip);

    // 查找用户
    const user = await authManager.getUserByEmailOrPhone(emailOrPhone);

    if (!user) {
      // 记录失败的登录尝试（使用临时用户ID）
      await authManager.createLoginHistory({
        userId: 'anonymous',
        ip,
        userAgent,
        deviceType,
        location,
        status: 'failed',
        failureReason: 'user_not_found',
      });

      return NextResponse.json(
        { success: false, message: '邮箱/手机号或密码错误' },
        { status: 401 }
      );
    }

    // 验证密码
    const isPasswordValid = await verifyPassword(password, user.password || '');

    if (!isPasswordValid) {
      // 记录失败的登录尝试
      await authManager.createLoginHistory({
        userId: user.id,
        ip,
        userAgent,
        deviceType,
        location,
        status: 'failed',
        failureReason: 'invalid_password',
      });

      return NextResponse.json(
        { success: false, message: '邮箱/手机号或密码错误' },
        { status: 401 }
      );
    }

    // 检查用户状态
    if (user.status === 'banned') {
      return NextResponse.json(
        { success: false, message: '该账号已被封禁' },
        { status: 403 }
      );
    }

    if (user.status === 'suspended') {
      return NextResponse.json(
        { success: false, message: '该账号已被暂停' },
        { status: 403 }
      );
    }

    // 生成会话ID
    const sessionId = `session_${user.id}_${Date.now()}`;

    // 生成令牌对
    const tokenPair = generateTokenPair({
      userId: user.id,
      sessionId,
      role: user.role,
      shardId: user.shardId,
    });

    // 创建会话
    await authManager.createSession({
      sessionId,
      userId: user.id,
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

    // 更新用户的登录信息
    await authManager.incrementLoginCount(user.id);

    // 创建审计日志
    await authManager.createAuditLog({
      userId: user.id,
      action: 'login',
      resource: 'user',
      resourceId: user.id,
      details: { sessionId, ip },
      ip,
      userAgent,
      result: 'success',
    });

    // 记录成功的登录历史
    await authManager.createLoginHistory({
      userId: user.id,
      ip,
      userAgent,
      deviceType,
      location,
      status: 'success',
    });

    // 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        success: true,
        message: '登录成功',
        data: {
          user: userWithoutPassword,
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
    console.error('Login error:', error);
    return NextResponse.json(
      {
        success: false,
        message: '登录失败，请稍后重试',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
