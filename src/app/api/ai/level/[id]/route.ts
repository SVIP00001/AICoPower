import { NextResponse } from 'next/server';
import { aiManager } from '@/storage/database/aiManager';

/**
 * 获取AI等级评定结果
 * 
 * GET /api/ai/level/[id]
 * 
 * 获取指定AI的等级评定详情
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const evaluation = await aiManager.evaluateAILevel(id);

    return NextResponse.json({
      success: true,
      data: evaluation,
    });

  } catch (error) {
    console.error('获取AI等级评定结果失败：', error);
    return NextResponse.json(
      {
        error: '获取AI等级评定结果失败',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
