import { NextResponse } from 'next/server';
import { aiManager } from '@/storage/database/aiManager';
import { authManager } from '@/storage/database';

/**
 * 获取AI资质认证审核信息
 * 
 * GET /api/ai/qualification/[id]/review
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const credentials = await aiManager.getAIMerchantCredentials(id);

    if (!credentials) {
      return NextResponse.json(
        { error: '资质认证不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: credentials,
    });

  } catch (error) {
    console.error('获取资质认证信息失败：', error);
    return NextResponse.json(
      {
        error: '获取资质认证信息失败',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * 审核AI资质认证
 * 
 * POST /api/ai/qualification/[id]/review
 * 
 * 仅管理员可以审核资质认证
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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
        { error: '权限不足，仅管理员可以审核' },
        { status: 403 }
      );
    }

    // 解析请求体
    const body = await request.json();
    const { status, comment } = body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: '状态无效，必须为 approved 或 rejected' },
        { status: 400 }
      );
    }

    // 审核资质认证
    const credentials = await aiManager.reviewAIMerchantCredentials(
      id,
      status,
      session.userId,
      comment
    );

    return NextResponse.json({
      success: true,
      message: status === 'approved' ? '资质认证审核通过' : '资质认证审核拒绝',
      data: credentials,
    });

  } catch (error) {
    console.error('审核资质认证失败：', error);
    return NextResponse.json(
      {
        error: '审核资质认证失败',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
