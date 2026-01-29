import { NextResponse } from 'next/server';
import { aiManager } from '@/storage/database/aiManager';
import { authManager } from '@/storage/database';

/**
 * 获取测试题目
 * 
 * GET /api/ai/test-questions?type=xxx&aiType=xxx&level=xxx&status=active&limit=20
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const filters = {
      type: searchParams.get('type') || undefined,
      aiType: searchParams.get('aiType') || undefined,
      level: searchParams.get('level') || undefined,
      status: searchParams.get('status') || 'active',
      limit: searchParams.get('limit')
        ? parseInt(searchParams.get('limit')!)
        : 20,
    };

    const questions = await aiManager.getTestQuestions(filters);

    return NextResponse.json({
      success: true,
      data: questions,
    });

  } catch (error) {
    console.error('获取测试题目失败：', error);
    return NextResponse.json(
      {
        error: '获取测试题目失败',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * 创建测试题目
 * 
 * POST /api/ai/test-questions
 * 
 * 仅管理员可以创建测试题目
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
        { error: '权限不足，仅管理员可以创建测试题目' },
        { status: 403 }
      );
    }

    // 解析请求体
    const body = await request.json();
    const {
      type,
      aiType,
      level,
      question,
      options,
      correctAnswer,
      explanation,
      difficulty = 1,
      weight = 1,
    } = body;

    // 验证必填字段
    if (!type || !aiType || !question || !correctAnswer) {
      return NextResponse.json(
        { error: '类型、AI类型、题目和正确答案为必填字段' },
        { status: 400 }
      );
    }

    // 创建测试题目
    const testQuestion = await aiManager.createTestQuestion({
      type,
      aiType,
      level,
      question,
      options,
      correctAnswer,
      explanation,
      difficulty,
      weight,
    });

    return NextResponse.json({
      success: true,
      message: '测试题目创建成功',
      data: testQuestion,
    });

  } catch (error) {
    console.error('创建测试题目失败：', error);
    return NextResponse.json(
      {
        error: '创建测试题目失败',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
