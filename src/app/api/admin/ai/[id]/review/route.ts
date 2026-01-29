import { NextResponse } from 'next/server';
import { aiManager } from '@/storage/database/aiManager';
import { authManager } from '@/storage/database';
import { AI_STATUS } from '@/storage/database/shared/schema';

/**
 * 审核AI
 *
 * POST /api/admin/ai/[id]/review
 *
 * 管理员审核AI，通过或拒绝
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
    const { approved, comment } = body;

    if (typeof approved !== 'boolean') {
      return NextResponse.json(
        { error: 'approved参数必须为布尔值' },
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

    // 更新AI状态
    if (approved) {
      // 通过审核，设置为active
      await aiManager.updateAIProfile(id, {
        status: AI_STATUS.ACTIVE,
      });
    } else {
      // 拒绝，可以保持pending或设置为suspended
      await aiManager.updateAIProfile(id, {
        status: AI_STATUS.SUSPENDED,
      });
    }

    // TODO: 记录审核日志（如果需要）

    return NextResponse.json({
      success: true,
      message: approved ? 'AI审核通过' : 'AI审核已拒绝',
      data: {
        id,
        status: approved ? AI_STATUS.ACTIVE : AI_STATUS.SUSPENDED,
        comment,
      },
    });

  } catch (error) {
    console.error('审核AI失败：', error);
    return NextResponse.json(
      {
        error: '审核AI失败',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
