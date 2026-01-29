import { NextResponse } from 'next/server';
import { aiManager } from '@/storage/database/aiManager';
import { authManager } from '@/storage/database';
import { AI_STATUS } from '@/storage/database/shared/schema';

/**
 * 更新AI状态（启用/禁用/封禁）
 *
 * POST /api/admin/ai/[id]/status
 *
 * 管理员启用、禁用或封禁AI
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // 获取AI ID
    const { id } = await params;

    // 解析请求体
    const body = await request.json();
    const { action } = body;

    // 验证action参数
    const validActions = ['activate', 'deactivate', 'ban'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: '无效的操作，必须是 activate、deactivate 或 ban' },
        { status: 400 }
      );
    }

    // 获取AI信息
    const ai = await aiManager.getAIProfileById(id);
    if (!ai) {
      return NextResponse.json(
        { error: 'AI不存在' },
        { status: 404 }
      );
    }

    // 根据action更新状态
    let newStatus: string;
    let message: string;

    switch (action) {
      case 'activate':
        newStatus = AI_STATUS.ACTIVE;
        message = 'AI已启用';
        break;
      case 'deactivate':
        newStatus = AI_STATUS.SUSPENDED;
        message = 'AI已禁用';
        break;
      case 'ban':
        newStatus = AI_STATUS.BANNED;
        message = 'AI已封禁';
        break;
      default:
        return NextResponse.json(
          { error: '无效的操作' },
          { status: 400 }
        );
    }

    // 更新AI状态
    await aiManager.updateAIProfile(id, {
      status: newStatus,
    });

    // TODO: 记录状态变更日志
    // TODO: 发送通知给AI所有者

    return NextResponse.json({
      success: true,
      message,
      data: {
        id,
        previousStatus: ai.status,
        newStatus,
      },
    });

  } catch (error) {
    console.error('更新AI状态失败：', error);
    return NextResponse.json(
      {
        error: '更新AI状态失败',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
