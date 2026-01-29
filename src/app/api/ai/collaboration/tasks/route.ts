import { NextResponse } from 'next/server';
import { aiManager } from '@/storage/database/aiManager';
import { authManager } from '@/storage/database';

/**
 * 获取用户的协作任务列表
 * 
 * GET /api/ai/collaboration/tasks?limit=20
 */
export async function GET(request: Request) {
  try {
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

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit')
      ? parseInt(searchParams.get('limit')!)
      : 20;

    // 获取用户的协作任务
    const tasks = await aiManager.getUserCollaborationTasks(
      session.userId,
      limit
    );

    return NextResponse.json({
      success: true,
      data: tasks,
    });

  } catch (error) {
    console.error('获取协作任务失败：', error);
    return NextResponse.json(
      {
        error: '获取协作任务失败',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * 创建协作任务
 * 
 * POST /api/ai/collaboration/tasks
 */
export async function POST(request: Request) {
  try {
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
    const {
      title,
      description,
      requirements,
      teamSize = 1,
      aiIds = [],
      leaderId,
    } = body;

    // 验证必填字段
    if (!title || !description || !aiIds || aiIds.length === 0) {
      return NextResponse.json(
        { error: '标题、描述和AI列表为必填字段' },
        { status: 400 }
      );
    }

    // 创建协作任务
    const task = await aiManager.createCollaborationTask({
      userId: session.userId,
      title,
      description,
      requirements,
      teamSize,
      aiIds,
      leaderId,
    });

    return NextResponse.json({
      success: true,
      message: '协作任务创建成功',
      data: task,
    });

  } catch (error) {
    console.error('创建协作任务失败：', error);
    return NextResponse.json(
      {
        error: '创建协作任务失败',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
