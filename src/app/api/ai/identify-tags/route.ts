import { NextResponse } from 'next/server';
import { aiManager } from '@/storage/database/aiManager';

/**
 * 识别AI能力标签
 * 
 * POST /api/ai/identify-tags
 * 
 * 基于AI的描述和类型，智能识别推荐的能力标签
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { description, type = 'general' } = body;

    if (!description) {
      return NextResponse.json(
        { error: '描述为必填字段' },
        { status: 400 }
      );
    }

    // 预定义的标签库（可以根据不同类型定义不同的标签）
    const tagLibrary: Record<string, string[]> = {
      general: [
        '通用大模型', '代码开发', '内容创作', '翻译服务', '问答助手',
        '文本分析', '摘要生成', '文档处理', '语言理解', '逻辑推理'
      ],
      vertical: [
        '金融分析', '医疗健康', '法律咨询', '教育培训', '电商服务',
        '营销推广', '数据分析', '行业知识', '专业咨询', '智能客服'
      ],
      startup: [
        '快速响应', '轻量级', '低成本', '创新型', '灵活部署',
        '个性化', '小团队', '敏捷开发', '快速迭代', '场景化'
      ],
      tool: [
        '数据处理', '图像识别', '语音处理', '视频分析', '自动化',
        '工具集成', 'API服务', '批量处理', '格式转换', '数据清洗'
      ],
      merchant: [
        '商业智能', '订单处理', '客户服务', '营销支持', '销售助手',
        '库存管理', '数据分析', '报表生成', '流程优化', '决策支持'
      ],
    };

    // 根据描述内容匹配标签（简单的关键词匹配）
    const descriptionLower = description.toLowerCase();
    const baseTags = tagLibrary[type] || tagLibrary.general;

    const matchedTags: string[] = [];

    // 简单的关键词匹配逻辑
    if (descriptionLower.includes('代码') || descriptionLower.includes('programming') || descriptionLower.includes('developer')) {
      matchedTags.push('代码开发');
    }
    if (descriptionLower.includes('翻译') || descriptionLower.includes('translate') || descriptionLower.includes('language')) {
      matchedTags.push('翻译服务');
    }
    if (descriptionLower.includes('写作') || descriptionLower.includes('创作') || descriptionLower.includes('writing')) {
      matchedTags.push('内容创作');
    }
    if (descriptionLower.includes('问答') || descriptionLower.includes('assistant') || descriptionLower.includes('chat')) {
      matchedTags.push('问答助手');
    }
    if (descriptionLower.includes('分析') || descriptionLower.includes('analysis') || descriptionLower.includes('analytics')) {
      matchedTags.push('文本分析');
    }
    if (descriptionLower.includes('摘要') || descriptionLower.includes('summary') || descriptionLower.includes('summarize')) {
      matchedTags.push('摘要生成');
    }
    if (descriptionLower.includes('金融') || descriptionLower.includes('financial') || descriptionLower.includes('finance')) {
      matchedTags.push('金融分析');
    }
    if (descriptionLower.includes('医疗') || descriptionLower.includes('health') || descriptionLower.includes('medical')) {
      matchedTags.push('医疗健康');
    }
    if (descriptionLower.includes('客户') || descriptionLower.includes('customer') || descriptionLower.includes('service')) {
      matchedTags.push('智能客服');
    }

    // 如果没有匹配到标签，返回类型相关的前几个标签作为默认推荐
    if (matchedTags.length === 0) {
      matchedTags.push(...baseTags.slice(0, 3));
    }

    // 去重并限制数量
    const uniqueTags = [...new Set(matchedTags)].slice(0, 5);

    return NextResponse.json({
      success: true,
      data: {
        recommendedTags: uniqueTags,
        allTags: baseTags,
      },
    });

  } catch (error) {
    console.error('识别标签失败：', error);
    return NextResponse.json(
      {
        error: '识别标签失败',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
