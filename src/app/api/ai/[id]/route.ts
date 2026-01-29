import { NextResponse } from 'next/server';
import { aiManager } from '@/storage/database/aiManager';

/**
 * 获取AI详情
 * 
 * GET /api/ai/[id]
 * 
 * 根据ID获取AI的详细信息
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 获取AI详情
    const aiProfile = await aiManager.getAIProfileById(id);

    if (!aiProfile) {
      return NextResponse.json(
        { error: 'AI不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: aiProfile,
    });

  } catch (error) {
    console.error('获取AI详情失败：', error);
    return NextResponse.json(
      {
        error: '获取AI详情失败',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
