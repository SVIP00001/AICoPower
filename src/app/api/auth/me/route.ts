import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, extractTokenFromHeader } from '@/lib/jwt';
import { authManager } from '@/storage/database';

export async function GET(request: NextRequest) {
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

    // 获取用户
    const user = await authManager.getUserById(payload.userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: '用户不存在' },
        { status: 404 }
      );
    }

    // 更新会话最后活跃时间
    await authManager.updateSessionLastActive(payload.sessionId);

    // 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        success: true,
        data: {
          user: userWithoutPassword,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : '获取用户信息失败',
      },
      { status: 401 }
    );
  }
}
