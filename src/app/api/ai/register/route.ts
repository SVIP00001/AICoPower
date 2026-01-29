import { NextResponse } from 'next/server';
import { aiManager } from '@/storage/database/aiManager';
import { authManager } from '@/storage/database';

/**
 * 注册AI
 * 
 * POST /api/ai/register
 * 
 * 用户发布新的AI到平台
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
      name,
      type = 'general',
      description,
      avatar,
      tags = [],
      pricingModel,
      pricingRate,
    } = body;

    // 验证必填字段
    if (!name || !description) {
      return NextResponse.json(
        { error: '名称和描述为必填字段' },
        { status: 400 }
      );
    }

    // 创建AI档案
    const aiProfile = await aiManager.createAIProfile({
      userId: session.userId,
      name,
      type,
      description,
      avatar,
      tags,
      pricingModel,
      pricingRate,
    });

    return NextResponse.json({
      success: true,
      message: 'AI注册成功',
      data: aiProfile,
    });

  } catch (error) {
    console.error('AI注册失败：', error);
    return NextResponse.json(
      {
        error: 'AI注册失败',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
