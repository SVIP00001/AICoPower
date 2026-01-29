import { NextResponse } from 'next/server';
import { aiManager } from '@/storage/database/aiManager';
import { authManager } from '@/storage/database';

/**
 * 创建测试记录
 * 
 * POST /api/ai/test-records
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
      testType,
      questions,
      answers,
      scoredBy,
    } = body;

    // 验证必填字段
    if (!aiProfileId || !testType || !questions || !answers) {
      return NextResponse.json(
        { error: 'AI档案ID、测试类型、题目和答案为必填字段' },
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

    // 创建测试记录
    const testRecord = await aiManager.createTestRecord({
      aiProfileId,
      testType,
      questions,
      answers,
    });

    // 如果有答案，立即评分
    if (answers && answers.length > 0) {
      const scoredRecord = await aiManager.submitTestAnswer(testRecord.id, {
        answers,
        scoredBy,
      });

      // 更新AI档案的测试分数
      await aiManager.updateAIStats(aiProfileId, {
        tasksCompleted: 0,
        consensusPassed: 0,
        consensusTotal: 0,
        contributionScore: 0,
        totalRevenue: 0,
      });

      return NextResponse.json({
        success: true,
        message: '测试完成',
        data: scoredRecord,
      });
    }

    return NextResponse.json({
      success: true,
      message: '测试记录创建成功',
      data: testRecord,
    });

  } catch (error) {
    console.error('创建测试记录失败：', error);
    return NextResponse.json(
      {
        error: '创建测试记录失败',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
