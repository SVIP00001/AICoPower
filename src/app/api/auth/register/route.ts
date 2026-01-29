import { NextRequest, NextResponse } from 'next/server';
import { authManager } from '@/storage/database';
import { hashPassword, validatePasswordStrength } from '@/lib/password';
import { generateTokenPair } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, phone, username, password, nickname, role = 'consumer' } = body;

    // 验证必填字段
    if (!password) {
      return NextResponse.json(
        { success: false, message: '密码不能为空' },
        { status: 400 }
      );
    }

    // 验证邮箱或手机号至少提供一个
    if (!email && !phone) {
      return NextResponse.json(
        { success: false, message: '邮箱或手机号至少提供一个' },
        { status: 400 }
      );
    }

    // 验证密码强度
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { success: false, message: passwordValidation.message },
        { status: 400 }
      );
    }

    // 检查邮箱是否已存在
    if (email) {
      const existingUser = await authManager.getUserByEmail(email);
      if (existingUser) {
        return NextResponse.json(
          { success: false, message: '该邮箱已被注册' },
          { status: 409 }
        );
      }
    }

    // 检查手机号是否已存在
    if (phone) {
      const existingUser = await authManager.getUserByPhone(phone);
      if (existingUser) {
        return NextResponse.json(
          { success: false, message: '该手机号已被注册' },
          { status: 409 }
        );
      }
    }

    // 检查用户名是否已存在
    if (username) {
      const existingUser = await authManager.getUserByUsername(username);
      if (existingUser) {
        return NextResponse.json(
          { success: false, message: '该用户名已被注册' },
          { status: 409 }
        );
      }
    }

    // 哈希密码
    const hashedPassword = await hashPassword(password);

    // 创建用户（默认赋予双重身份）
    const user = await authManager.createUser({
      email,
      phone,
      username,
      password: hashedPassword,
      nickname: nickname || username || email?.split('@')[0] || '用户',
      role: role === 'super_admin' || role === 'admin' ? role : 'user',
    });

    // 生成会话ID
    const sessionId = `session_${user.id}_${Date.now()}`;

    // 生成令牌对
    const tokenPair = generateTokenPair({
      userId: user.id,
      sessionId,
      role: user.role,
      shardId: user.shardId,
    });

    // 获取客户端信息
    const userAgent = request.headers.get('user-agent') || '';
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';

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

    // 创建审计日志
    await authManager.createAuditLog({
      userId: user.id,
      action: 'register',
      resource: 'user',
      resourceId: user.id,
      details: { email, phone, username },
      ip,
      userAgent,
      result: 'success',
    });

    // 记录登录历史
    await authManager.createLoginHistory({
      userId: user.id,
      ip,
      userAgent,
      deviceType: 'web',
      location: null,
      status: 'success',
    });

    // 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        success: true,
        message: '注册成功',
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
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      {
        success: false,
        message: '注册失败，请稍后重试',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
