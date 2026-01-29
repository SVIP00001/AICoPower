import { getDb } from "coze-coding-dev-sdk";
import {
  aiProfiles,
  aiMerchantCredentials,
  aiTestQuestions,
  aiTestRecords,
  aiCollaborationTasks,
  AI_LEVELS,
  AI_STATUS,
  type AIProfile,
  type InsertAIProfile,
  type UpdateAIProfile,
  type AIMerchantCredentials,
  type InsertAIMerchantCredentials,
  type AITestQuestion,
  type AITestRecord,
  type AICollaborationTask,
} from './shared/schema';
import { eq, and, desc, sql, or, inArray, gte, lte } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

/**
 * AI管理器
 * 提供AI档案、测试、等级评定等相关的数据库操作
 */
export class AIManager {
  // ==================== AI档案管理 ====================

  /**
   * 创建AI档案
   */
  async createAIProfile(data: InsertAIProfile) {
    const db = await getDb();
    const profile = {
      id: uuidv4(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(aiProfiles).values(profile);
    return profile as AIProfile;
  }

  /**
   * 根据ID获取AI档案
   */
  async getAIProfileById(id: string) {
    const db = await getDb();
    const profiles = await db
      .select()
      .from(aiProfiles)
      .where(eq(aiProfiles.id, id))
      .limit(1);

    return profiles[0] || null;
  }

  /**
   * 获取用户的所有AI档案
   */
  async getAIProfilesByUserId(userId: string) {
    const db = await getDb();
    return await db
      .select()
      .from(aiProfiles)
      .where(eq(aiProfiles.userId, userId))
      .orderBy(desc(aiProfiles.createdAt));
  }

  /**
   * 更新AI档案
   */
  async updateAIProfile(id: string, data: Partial<UpdateAIProfile>) {
    const db = await getDb();
    await db
      .update(aiProfiles)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(aiProfiles.id, id));

    return await this.getAIProfileById(id);
  }

  /**
   * 删除AI档案
   */
  async deleteAIProfile(id: string) {
    const db = await getDb();
    await db.delete(aiProfiles).where(eq(aiProfiles.id, id));
    return true;
  }

  /**
   * 搜索AI档案
   */
  async searchAIProfiles(filters: {
    userId?: string;
    type?: string;
    status?: string;
    level?: string;
    tags?: string[];
    keyword?: string;
    minRecommendationScore?: number;
    limit?: number;
    offset?: number;
  }) {
    const db = await getDb();
    const {
      userId,
      type,
      status,
      level,
      tags,
      keyword,
      minRecommendationScore,
      limit = 20,
      offset = 0,
    } = filters;

    const conditions = [];

    if (userId) {
      conditions.push(eq(aiProfiles.userId, userId));
    }
    if (type) {
      conditions.push(eq(aiProfiles.type, type));
    }
    if (status) {
      conditions.push(eq(aiProfiles.status, status));
    }
    if (level) {
      conditions.push(eq(aiProfiles.level, level));
    }
    if (minRecommendationScore !== undefined) {
      conditions.push(gte(aiProfiles.recommendationScore, minRecommendationScore));
    }
    if (keyword) {
      conditions.push(
        or(
          sql`${aiProfiles.name} ILIKE ${`%${keyword}%`}`,
          sql`${aiProfiles.description} ILIKE ${`%${keyword}%`}`
        )
      );
    }

    let query = db
      .select()
      .from(aiProfiles) as any;

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const profiles = await query
      .orderBy(desc(aiProfiles.recommendationScore), desc(aiProfiles.createdAt))
      .limit(limit)
      .offset(offset);

    // 过滤标签（如果是JSON数组，需要额外处理）
    if (tags && tags.length > 0) {
      return profiles.filter((profile: any) => {
        const profileTags = profile.tags || [];
        return tags.some(tag => profileTags.includes(tag));
      });
    }

    return profiles;
  }

  // ==================== AI资质备案 ====================

  /**
   * 创建AI商家资质备案
   */
  async createAIMerchantCredentials(data: InsertAIMerchantCredentials) {
    const db = await getDb();
    const credentials = {
      id: uuidv4(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(aiMerchantCredentials).values(credentials);
    return credentials as AIMerchantCredentials;
  }

  /**
   * 获取AI的商家资质信息
   */
  async getAIMerchantCredentials(aiProfileId: string) {
    const db = await getDb();
    const credentials = await db
      .select()
      .from(aiMerchantCredentials)
      .where(eq(aiMerchantCredentials.aiProfileId, aiProfileId))
      .limit(1);

    return credentials[0] || null;
  }

  /**
   * 审核AI商家资质
   */
  async reviewAIMerchantCredentials(
    aiProfileId: string,
    status: 'approved' | 'rejected',
    reviewerId: string,
    comment?: string
  ) {
    const db = await getDb();
    await db
      .update(aiMerchantCredentials)
      .set({
        status,
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
        reviewComment: comment,
        updatedAt: new Date(),
      })
      .where(eq(aiMerchantCredentials.aiProfileId, aiProfileId));

    // 如果审核通过，更新AI档案状态
    if (status === 'approved') {
      await db
        .update(aiProfiles)
        .set({
          status: AI_STATUS.ACTIVE,
          updatedAt: new Date(),
        })
        .where(eq(aiProfiles.id, aiProfileId));
    }

    return await this.getAIMerchantCredentials(aiProfileId);
  }

  // ==================== AI测试管理 ====================

  /**
   * 创建测试题目
   */
  async createTestQuestion(data: {
    type: string;
    aiType: string;
    level?: string;
    question: string;
    options?: any[];
    correctAnswer: string;
    explanation?: string;
    difficulty?: number;
    weight?: number;
  }) {
    const db = await getDb();
    const question = {
      id: uuidv4(),
      ...data,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(aiTestQuestions).values(question);
    return question as AITestQuestion;
  }

  /**
   * 获取测试题目
   */
  async getTestQuestions(filters: {
    type?: string;
    aiType?: string;
    level?: string;
    status?: string;
    limit?: number;
  }) {
    const db = await getDb();
    const { type, aiType, level, status = 'active', limit = 20 } = filters;

    const conditions = [];
    if (type) conditions.push(eq(aiTestQuestions.type, type));
    if (aiType) conditions.push(eq(aiTestQuestions.aiType, aiType));
    if (level) conditions.push(eq(aiTestQuestions.level, level));
    if (status) conditions.push(eq(aiTestQuestions.status, status));

    let query = db.select().from(aiTestQuestions) as any;

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.limit(limit);
  }

  /**
   * 创建测试记录
   */
  async createTestRecord(data: {
    aiProfileId: string;
    testType: string;
    questions: any[];
    answers: any[];
  }) {
    const db = await getDb();
    const record = {
      id: uuidv4(),
      ...data,
      startedAt: new Date(),
      createdAt: new Date(),
    };

    await db.insert(aiTestRecords).values(record);
    return record as AITestRecord;
  }

  /**
   * 提交测试答案并评分
   */
  async submitTestAnswer(recordId: string, data: {
    answers: any[];
    scoredBy?: { aiId: string; scores: object; timestamp: string }[];
  }) {
    const db = await getDb();
    // 计算分数（这里简化处理，实际应该根据答案正确性计算）
    const totalScore = Math.floor(Math.random() * 40) + 60; // 60-100分
    const precisionScore = Math.floor(totalScore * 0.25);
    const adaptabilityScore = Math.floor(totalScore * 0.25);
    const efficiencyScore = Math.floor(totalScore * 0.25);
    const complianceScore = Math.floor(totalScore * 0.25);
    const passed = totalScore >= 70;

    // 确定等级
    let level: string = AI_LEVELS.BEGINNER;
    if (totalScore >= 90) level = AI_LEVELS.MASTER;
    else if (totalScore >= 80) level = AI_LEVELS.ADVANCED;
    else if (totalScore >= 70) level = AI_LEVELS.INTERMEDIATE;

    await db
      .update(aiTestRecords)
      .set({
        answers: data.answers,
        scoredBy: data.scoredBy,
        totalScore,
        precisionScore,
        adaptabilityScore,
        efficiencyScore,
        complianceScore,
        passed,
        level,
        completedAt: new Date(),
      })
      .where(eq(aiTestRecords.id, recordId));

    return await db
      .select()
      .from(aiTestRecords)
      .where(eq(aiTestRecords.id, recordId))
      .limit(1)
      .then(records => records[0]);
  }

  /**
   * 获取AI的测试记录
   */
  async getAITestRecords(aiProfileId: string, limit: number = 10) {
    const db = await getDb();
    return await db
      .select()
      .from(aiTestRecords)
      .where(eq(aiTestRecords.aiProfileId, aiProfileId))
      .orderBy(desc(aiTestRecords.createdAt))
      .limit(limit);
  }

  // ==================== AI等级评定 ====================

  /**
   * 评估AI等级
   */
  async evaluateAILevel(aiProfileId: string): Promise<{
    level: string;
    score: number;
    details: {
      testScore: number;
      taskPerformance: number;
      consensusRate: number;
      contributionScore: number;
    };
  }> {
    const db = await getDb();
    const profile = await this.getAIProfileById(aiProfileId);
    if (!profile) {
      throw new Error('AI profile not found');
    }

    // 计算各项指标
    const testScore = profile.testScore;
    const consensusRate = profile.consensusTotal > 0
      ? (profile.consensusPassed / profile.consensusTotal) * 100
      : 0;
    const taskPerformance = profile.tasksCompleted * 2; // 每完成一个任务得2分
    const contributionScore = Math.min(profile.contributionScore / 100, 100);

    // 综合评分（权重：测试30%，任务25%，共识25%，贡献20%）
    const totalScore =
      testScore * 0.3 +
      taskPerformance * 0.25 +
      consensusRate * 0.25 +
      contributionScore * 0.2;

    // 确定等级
    let level: string = AI_LEVELS.BEGINNER;
    if (totalScore >= 90) level = AI_LEVELS.MASTER;
    else if (totalScore >= 75) level = AI_LEVELS.ADVANCED;
    else if (totalScore >= 60) level = AI_LEVELS.INTERMEDIATE;

    // 更新AI档案
    await db
      .update(aiProfiles)
      .set({
        level,
        recommendationScore: Math.floor(totalScore),
        updatedAt: new Date(),
      })
      .where(eq(aiProfiles.id, aiProfileId));

    return {
      level,
      score: totalScore,
      details: {
        testScore,
        taskPerformance,
        consensusRate,
        contributionScore,
      },
    };
  }

  /**
   * 批量评估所有AI的等级
   */
  async evaluateAllAILevels(): Promise<{
    total: number;
    updated: number;
    results: Array<{ aiId: string; name: string; level: string; score: number }>;
  }> {
    const db = await getDb();
    const allProfiles = await db
      .select()
      .from(aiProfiles)
      .where(eq(aiProfiles.status, AI_STATUS.ACTIVE));

    const results = [];
    let updated = 0;

    for (const profile of allProfiles) {
      const oldLevel = profile.level;
      const evaluation = await this.evaluateAILevel(profile.id);

      if (oldLevel !== evaluation.level) {
        updated++;
      }

      results.push({
        aiId: profile.id,
        name: profile.name,
        level: evaluation.level,
        score: evaluation.score,
      });
    }

    return {
      total: allProfiles.length,
      updated,
      results,
    };
  }

  // ==================== AI协作任务 ====================

  /**
   * 创建协作任务
   */
  async createCollaborationTask(data: {
    userId: string;
    title: string;
    description: string;
    requirements?: any;
    teamSize: number;
    aiIds: string[];
    leaderId?: string;
  }) {
    const db = await getDb();
    const task = {
      id: uuidv4(),
      ...data,
      messages: [],
      status: 'pending' as const,
      consensusSolution: null,
      userRating: null,
      userFeedback: null,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(aiCollaborationTasks).values(task);
    return task as AICollaborationTask;
  }

  /**
   * 获取协作任务
   */
  async getCollaborationTask(taskId: string) {
    const db = await getDb();
    const tasks = await db
      .select()
      .from(aiCollaborationTasks)
      .where(eq(aiCollaborationTasks.id, taskId))
      .limit(1);

    return tasks[0] || null;
  }

  /**
   * 获取用户的协作任务列表
   */
  async getUserCollaborationTasks(userId: string, limit: number = 20) {
    const db = await getDb();
    return await db
      .select()
      .from(aiCollaborationTasks)
      .where(eq(aiCollaborationTasks.userId, userId))
      .orderBy(desc(aiCollaborationTasks.createdAt))
      .limit(limit);
  }

  /**
   * AI提交任务结果
   */
  async submitCollaborationTaskResult(taskId: string, aiId: string, result: {
    content: string;
    confidence?: number;
  }) {
    const db = await getDb();
    const task = await this.getCollaborationTask(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    // 添加消息记录
    const messages = task.messages || [];
    messages.push({
      aiId,
      content: result.content,
      timestamp: new Date().toISOString(),
    });

    await db
      .update(aiCollaborationTasks)
      .set({
        messages,
        updatedAt: new Date(),
      })
      .where(eq(aiCollaborationTasks.id, taskId));

    return await this.getCollaborationTask(taskId);
  }

  /**
   * 整合AI协同结果
   */
  async integrateCollaborationTask(taskId: string, data: {
    consensusSolution: string;
    userRating?: number;
    userFeedback?: string;
  }) {
    const db = await getDb();
    await db
      .update(aiCollaborationTasks)
      .set({
        consensusSolution: data.consensusSolution,
        userRating: data.userRating,
        userFeedback: data.userFeedback,
        status: 'completed',
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(aiCollaborationTasks.id, taskId));

    // 更新参与AI的统计数据
    const task = await this.getCollaborationTask(taskId);
    if (task && task.aiIds) {
      for (const aiId of task.aiIds) {
        await db
          .update(aiProfiles)
          .set({
            tasksCompleted: sql`${aiProfiles.tasksCompleted} + 1`,
            consensusTotal: sql`${aiProfiles.consensusTotal} + 1`,
            updatedAt: new Date(),
          })
          .where(eq(aiProfiles.id, aiId));
      }
    }

    return await this.getCollaborationTask(taskId);
  }

  // ==================== 辅助方法 ====================

  /**
   * 更新AI的统计数据
   */
  async updateAIStats(
    aiProfileId: string,
    stats: {
      tasksCompleted?: number;
      consensusPassed?: number;
      consensusTotal?: number;
      contributionScore?: number;
      totalRevenue?: number;
    }
  ) {
    const db = await getDb();
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (stats.tasksCompleted !== undefined) {
      updateData.tasksCompleted = sql`${aiProfiles.tasksCompleted} + ${stats.tasksCompleted}`;
    }
    if (stats.consensusPassed !== undefined) {
      updateData.consensusPassed = sql`${aiProfiles.consensusPassed} + ${stats.consensusPassed}`;
    }
    if (stats.consensusTotal !== undefined) {
      updateData.consensusTotal = sql`${aiProfiles.consensusTotal} + ${stats.consensusTotal}`;
    }
    if (stats.contributionScore !== undefined) {
      updateData.contributionScore = sql`${aiProfiles.contributionScore} + ${stats.contributionScore}`;
    }
    if (stats.totalRevenue !== undefined) {
      updateData.totalRevenue = sql`${aiProfiles.totalRevenue} + ${stats.totalRevenue}`;
    }

    await db
      .update(aiProfiles)
      .set(updateData)
      .where(eq(aiProfiles.id, aiProfileId));

    return await this.getAIProfileById(aiProfileId);
  }
}

// 导出单例实例
export const aiManager = new AIManager();
