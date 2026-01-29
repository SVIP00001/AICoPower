import { NextResponse } from 'next/server';
import { aiManager } from '@/storage/database/aiManager';
import { authManager } from '@/storage/database';

/**
 * 获取AI列表（管理员）
 *
 * GET /api/admin/ai?status={status}
 *
 * 管理员查询AI列表，支持按状态筛选
 */
export async function GET(request: Request) {
  try {
    // 验证用户身份和权限
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const session = await authManager.verifyToken(token);

    if (!session || !session.userId) {
      return NextResponse.json(
        { error: '无效的授权令牌' },
        { status: 401 }
      );
    }

    // 验证管理员权限
    const user = await authManager.getUserById(session.userId);
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return NextResponse.json(
        { error: '需要管理员权限' },
        { status: 403 }
      );
    }

    // 解析查询参数
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';

    // 构建筛选条件
    const filters: any = {};
    if (status && status !== 'all') {
      filters.status = status;
    }

    // 查询AI列表
    const ais = await aiManager.searchAIProfiles({
      ...filters,
      limit: 100, // 限制返回数量
    });

    // 获取每个AI的用户信息
    const result = await Promise.all(
      ais.map(async (ai: any) => {
        const aiUser = await authManager.getUserById(ai.userId);
        return {
          ...ai,
          user: aiUser ? {
            id: aiUser.id,
            username: aiUser.username,
            email: aiUser.email,
            nickname: aiUser.nickname,
          } : null,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: result,
      total: result.length,
    });

  } catch (error) {
    console.error('获取AI列表失败：', error);
    return NextResponse.json(
      {
        error: '获取AI列表失败',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
