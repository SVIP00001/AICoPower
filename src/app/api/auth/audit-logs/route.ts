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

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    // 获取审计日志
    const logs = await authManager.getAuditLogsByUserId(payload.userId, limit);

    return NextResponse.json(
      {
        success: true,
        data: {
          logs,
          count: logs.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get audit logs error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : '获取审计日志失败',
      },
      { status: 401 }
    );
  }
}
