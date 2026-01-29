import { NextResponse } from 'next/server';
import { aiManager } from '@/storage/database/aiManager';
import { authManager } from '@/storage/database';

/**
 * 提交AI商家资质认证
 * 
 * POST /api/ai/qualification
 * 
 * 用户提交AI的商家资质备案信息
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
      aiProfileId,
      companyName,
      businessLicense,
      aiComplianceReport,
    } = body;

    // 验证必填字段
    if (!aiProfileId || !companyName || !businessLicense || !aiComplianceReport) {
      return NextResponse.json(
        { error: '所有字段都为必填项' },
        { status: 400 }
      );
    }

    // 验证AI档案是否属于当前用户
    const aiProfile = await aiManager.getAIProfileById(aiProfileId);
    if (!aiProfile || aiProfile.userId !== session.userId) {
      return NextResponse.json(
        { error: 'AI档案不存在或无权限' },
        { status: 403 }
      );
    }

    // 创建商家资质备案
    const credentials = await aiManager.createAIMerchantCredentials({
      aiProfileId,
      companyName,
      businessLicense,
      aiComplianceReport,
    });

    return NextResponse.json({
      success: true,
      message: '资质认证提交成功，等待审核',
      data: credentials,
    });

  } catch (error) {
    console.error('提交资质认证失败：', error);
    return NextResponse.json(
      {
        error: '提交资质认证失败',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
