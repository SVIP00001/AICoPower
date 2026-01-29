import { NextResponse } from 'next/server';
import { aiManager } from '@/storage/database/aiManager';
import { authManager } from '@/storage/database';

/**
 * AI提交协作任务结果
 * 
 * POST /api/ai/collaboration/tasks/[taskId]/submit/[aiId]
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ taskId: string; aiId: string }> }
) {
  try {
    const { taskId, aiId } = await params;

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
    const { content, confidence } = body;

    if (!content) {
      return NextResponse.json(
        { error: '内容为必填字段' },
        { status: 400 }
      );
    }

    // 提交任务结果
    const task = await aiManager.submitCollaborationTaskResult(taskId, aiId, {
      content,
      confidence,
    });

    return NextResponse.json({
      success: true,
      message: '任务结果提交成功',
      data: task,
    });

  } catch (error) {
    console.error('提交任务结果失败：', error);
    return NextResponse.json(
      {
        error: '提交任务结果失败',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
