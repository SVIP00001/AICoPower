import { NextResponse } from 'next/server';
import { aiManager } from '@/storage/database/aiManager';
import { authManager } from '@/storage/database';

/**
 * 批量评估所有AI等级
 * 
 * POST /api/ai/level/evaluate-all
 * 
 * 仅管理员可以执行批量评估
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

    // 验证管理员权限
    const user = await authManager.getUserById(session.userId);
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return NextResponse.json(
        { error: '权限不足，仅管理员可以执行批量评估' },
        { status: 403 }
      );
    }

    // 执行批量评估
    const result = await aiManager.evaluateAllAILevels();

    return NextResponse.json({
      success: true,
      message: `批量评估完成，共评估 ${result.total} 个AI，更新了 ${result.updated} 个`,
      data: result,
    });

  } catch (error) {
    console.error('批量评估失败：', error);
    return NextResponse.json(
      {
        error: '批量评估失败',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
