import { NextResponse } from 'next/server';
import { aiManager } from '@/storage/database/aiManager';
import { verifyAccessToken } from '@/lib/jwt';

/**
 * 搜索AI
 *
 * GET /api/ai/search?keyword=xxx&type=xxx&status=xxx&level=xxx&tags=xxx&minScore=xxx&limit=20&offset=0
 *
 * 根据条件搜索AI列表（仅返回当前用户发布的AI）
 */
export async function GET(request: Request) {
  try {
    // 验证用户身份
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);

    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Token 无效' },
        { status: 401 }
      );
    }

    const userId = payload.userId;

    const { searchParams } = new URL(request.url);

    const filters = {
      userId, // 从token中获取userId，确保只查询当前用户的AI
      keyword: searchParams.get('keyword') || undefined,
      type: searchParams.get('type') || undefined,
      status: searchParams.get('status') || undefined,
      level: searchParams.get('level') || undefined,
      tags: searchParams.get('tags')?.split(',').filter(Boolean) || [],
      minRecommendationScore: searchParams.get('minScore')
        ? parseInt(searchParams.get('minScore')!)
        : undefined,
      limit: searchParams.get('limit')
        ? parseInt(searchParams.get('limit')!)
        : 20,
      offset: searchParams.get('offset')
        ? parseInt(searchParams.get('offset')!)
        : 0,
    };

    // 搜索AI
    const aiProfiles = await aiManager.searchAIProfiles(filters);

    return NextResponse.json({
      success: true,
      data: aiProfiles,
      pagination: {
        limit: filters.limit,
        offset: filters.offset,
        total: aiProfiles.length,
      },
    });

  } catch (error) {
    console.error('搜索AI失败：', error);
    return NextResponse.json(
      {
        error: '搜索AI失败',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
