import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { loginHistory } from '@/storage/database/shared/schema';
import { eq, desc, and, count } from 'drizzle-orm';
import { verifyAccessToken } from '@/lib/jwt';
import { maskIP } from '@/lib/clientInfo';

/**
 * 获取用户登录历史（支持分页）
 */
export async function GET(request: NextRequest) {
  try {
    // 验证用户身份
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: '未授权访问' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);

    if (!payload) {
      return NextResponse.json({ success: false, message: 'Token 无效' }, { status: 401 });
    }

    // 获取分页参数
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);

    // 验证分页参数
    if (page < 1 || pageSize < 1 || pageSize > 100) {
      return NextResponse.json(
        { success: false, message: '分页参数无效' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 获取总数（所有记录，包括失败）
    const [totalCount] = await db
      .select({ count: count() })
      .from(loginHistory)
      .where(eq(loginHistory.userId, payload.userId));

    const total = totalCount?.count || 0;

    // 计算分页
    const offset = (page - 1) * pageSize;
    const totalPages = Math.ceil(total / pageSize);

    // 获取登录历史（返回所有记录，包括失败的）
    const history = await db
      .select()
      .from(loginHistory)
      .where(eq(loginHistory.userId, payload.userId))
      .orderBy(desc(loginHistory.loginTime))
      .limit(pageSize)
      .offset(offset);

    // 转换数据格式
    const formattedHistory = history.map((h) => ({
      id: h.id,
      loginTime: h.loginTime?.toISOString(),
      logoutTime: h.logoutTime?.toISOString() || null,
      ip: h.ip || '未知',
      maskedIp: h.ip ? maskIP(h.ip) : '未知',
      deviceType: h.deviceType || 'unknown',
      userAgent: h.userAgent || '未知',
      location: h.location || '未知',
      status: h.status,
      failureReason: h.failureReason || null,
    }));

    return NextResponse.json({
      success: true,
      data: {
        history: formattedHistory,
        pagination: {
          page,
          pageSize,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('获取登录历史失败:', error);
    return NextResponse.json(
      { success: false, message: '获取登录历史失败' },
      { status: 500 }
    );
  }
}
