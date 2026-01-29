import { NextResponse } from 'next/server';
import { aiManager } from '@/storage/database/aiManager';
import { authManager } from '@/storage/database';

/**
 * 整合AI协同结果
 * 
 * POST /api/ai/collaboration/tasks/[taskId]/integrate
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;

    // 验证用户身份
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

    // 解析请求体
    const body = await request.json();
    const { consensusSolution, userRating, userFeedback } = body;

    if (!consensusSolution) {
      return NextResponse.json(
        { error: '共识方案为必填字段' },
        { status: 400 }
      );
    }

    // 整合协同结果
    const task = await aiManager.integrateCollaborationTask(taskId, {
      consensusSolution,
      userRating,
      userFeedback,
    });

    return NextResponse.json({
      success: true,
      message: '协同结果整合成功',
      data: task,
    });

  } catch (error) {
    console.error('整合协同结果失败：', error);
    return NextResponse.json(
      {
        error: '整合协同结果失败',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
