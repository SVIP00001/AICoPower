import { pgTable, text, varchar, timestamp, boolean, integer, jsonb, index, serial } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { createSchemaFactory } from "drizzle-zod"
import { z } from "zod"

// 用户表
export const users = pgTable(
  "users",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    username: varchar("username", { length: 50 }).unique(),
    email: varchar("email", { length: 255 }).unique(),
    phone: varchar("phone", { length: 20 }).unique(),
    password: text("password"), // bcrypt hash
    avatar: text("avatar"),
    nickname: varchar("nickname", { length: 100 }).notNull().default(""),
    bio: text("bio"),
    location: varchar("location", { length: 100 }),
    role: varchar("role", { length: 20 }).notNull().default("user"), // super_admin, admin, user
    status: varchar("status", { length: 20 }).notNull().default("active"), // active, inactive, suspended, banned
    // identityType: varchar("identity_type", { length: 20 }).notNull().default("both"), // 已废弃：不再区分身份类型
    emailVerified: boolean("email_verified").notNull().default(false),
    phoneVerified: boolean("phone_verified").notNull().default(false),
    twoFactorEnabled: boolean("two_factor_enabled").notNull().default(false),
    shardId: integer("shard_id").notNull().default(0),
    taskCount: integer("task_count").notNull().default(0),
    loginCount: integer("login_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    lastLoginIp: text("last_login_ip"),
  },
  (table) => ({
    emailIdx: index("users_email_idx").on(table.email),
    phoneIdx: index("users_phone_idx").on(table.phone),
    usernameIdx: index("users_username_idx").on(table.username),
  })
)

// 会话表（存储 JWT token 信息）
export const sessions = pgTable(
  "sessions",
  {
    id: serial("id").primaryKey(),
    sessionId: varchar("session_id", { length: 255 }).notNull().unique(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    token: text("token").notNull(), // access token
    refreshToken: text("refresh_token").notNull(),
    deviceId: varchar("device_id", { length: 255 }),
    deviceInfo: jsonb("device_info"),
    ip: text("ip"),
    userAgent: text("user_agent"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    lastActiveAt: timestamp("last_active_at", { withTimezone: true }).defaultNow().notNull(),
    revoked: boolean("revoked").notNull().default(false),
  },
  (table) => ({
    sessionIdx: index("sessions_session_id_idx").on(table.sessionId),
    userIdIdx: index("sessions_user_id_idx").on(table.userId),
    tokenIdx: index("sessions_token_idx").on(table.token),
    refreshTokenIdx: index("sessions_refresh_token_idx").on(table.refreshToken),
  })
)

// 登录历史记录表
export const loginHistory = pgTable(
  "login_history",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    loginTime: timestamp("login_time", { withTimezone: true }).defaultNow().notNull(),
    logoutTime: timestamp("logout_time", { withTimezone: true }),
    ip: text("ip"),
    userAgent: text("user_agent"),
    deviceType: varchar("device_type", { length: 50 }), // web, mobile, desktop
    location: text("location"),
    status: varchar("status", { length: 20 }).notNull(), // success, failed
    failureReason: text("failure_reason"),
  },
  (table) => ({
    userIdIdx: index("login_history_user_id_idx").on(table.userId),
    loginTimeIdx: index("login_history_login_time_idx").on(table.loginTime),
  })
)

// 安全审计日志表
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id", { length: 36 }),
    action: varchar("action", { length: 100 }).notNull(),
    resource: varchar("resource", { length: 100 }).notNull(),
    resourceId: varchar("resource_id", { length: 36 }),
    details: jsonb("details"),
    ip: text("ip"),
    userAgent: text("user_agent"),
    result: varchar("result", { length: 20 }).notNull(), // success, failure
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("audit_logs_user_id_idx").on(table.userId),
    actionIdx: index("audit_logs_action_idx").on(table.action),
    resourceIdx: index("audit_logs_resource_idx").on(table.resource),
    createdAtIdx: index("audit_logs_created_at_idx").on(table.createdAt),
  })
)

// 使用 createSchemaFactory 配置 date coercion
const { createInsertSchema: createCoercedInsertSchema } = createSchemaFactory({
  coerce: { date: true },
})

// Zod schemas for validation
export const insertUserSchema = createCoercedInsertSchema(users).pick({
  username: true,
  email: true,
  phone: true,
  password: true,
  nickname: true,
  bio: true,
  location: true,
  role: true,
})

export const updateUserSchema = createCoercedInsertSchema(users)
  .pick({
    username: true,
    email: true,
    phone: true,
    avatar: true,
    nickname: true,
    bio: true,
    location: true,
    role: true,
    // identityType: true, // 已废弃
    status: true,
    emailVerified: true,
    phoneVerified: true,
    twoFactorEnabled: true,
  })
  .partial()

export const insertSessionSchema = createCoercedInsertSchema(sessions).pick({
  sessionId: true,
  userId: true,
  token: true,
  refreshToken: true,
  deviceId: true,
  deviceInfo: true,
  ip: true,
  userAgent: true,
  expiresAt: true,
  refreshTokenExpiresAt: true,
})

export const insertLoginHistorySchema = createCoercedInsertSchema(loginHistory).pick({
  userId: true,
  ip: true,
  userAgent: true,
  deviceType: true,
  location: true,
  status: true,
  failureReason: true,
})

export const insertAuditLogSchema = createCoercedInsertSchema(auditLogs).pick({
  userId: true,
  action: true,
  resource: true,
  resourceId: true,
  details: true,
  ip: true,
  userAgent: true,
  result: true,
  errorMessage: true,
})

// TypeScript types
export type User = typeof users.$inferSelect
export type InsertUser = z.infer<typeof insertUserSchema>
export type UpdateUser = z.infer<typeof updateUserSchema>
export type Session = typeof sessions.$inferSelect
export type InsertSession = z.infer<typeof insertSessionSchema>
export type LoginHistory = typeof loginHistory.$inferSelect
export type InsertLoginHistory = z.infer<typeof insertLoginHistorySchema>
export type AuditLog = typeof auditLogs.$inferSelect
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>

// ==================== AI 相关表 ====================

// AI类型枚举
export const AI_TYPES = {
  GENERAL: 'general', // 通用大模型
  VERTICAL: 'vertical', // 垂直领域AI
  STARTUP: 'startup', // 中小创新AI
  TOOL: 'tool', // 工具类AI
  MERCHANT: 'merchant', // 商家AI
} as const;

// AI状态枚举
export const AI_STATUS = {
  PENDING: 'pending', // 待审核
  TESTING: 'testing', // 测试中
  CERTIFIED: 'certified', // 已认证
  ACTIVE: 'active', // 活跃
  SUSPENDED: 'suspended', // 暂停
  BANNED: 'banned', // 封禁
} as const;

// AI能力等级
export const AI_LEVELS = {
  BEGINNER: 'beginner', // 初级
  INTERMEDIATE: 'intermediate', // 中级
  ADVANCED: 'advanced', // 高级
  MASTER: 'master', // 顶尖
} as const;

// AI档案表
export const aiProfiles = pgTable(
  "ai_profiles",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id", { length: 36 }).notNull(), // 关联用户ID
    name: varchar("name", { length: 100 }).notNull(), // AI名称
    type: varchar("type", { length: 20 }).notNull().default('general'), // AI类型
    description: text("description"), // AI描述
    avatar: text("avatar"), // AI头像
    
    // 能力标签（JSON数组）
    tags: jsonb("tags").$type<string[]>(),
    
    // 认证信息
    level: varchar("level", { length: 20 }).notNull().default('beginner'), // 能力等级
    certifiedAt: timestamp("certified_at", { withTimezone: true }), // 认证时间
    
    // 测试分数
    testScore: integer("test_score").notNull().default(0), // 测试得分（0-100）
    testPrecision: integer("test_precision").notNull().default(0), // 精准度（0-25）
    testAdaptability: integer("test_adaptability").notNull().default(0), // 适配性（0-25）
    testEfficiency: integer("test_efficiency").notNull().default(0), // 效率（0-25）
    testCompliance: integer("test_compliance").notNull().default(0), // 合规性（0-25）
    testRetakeCount: integer("test_retake_count").notNull().default(0), // 复测次数
    lastTestAt: timestamp("last_test_at", { withTimezone: true }), // 最后测试时间
    nextTestAt: timestamp("next_test_at", { withTimezone: true }), // 下次测试时间
    
    // 推荐值（0-100）
    recommendationScore: integer("recommendation_score").notNull().default(0),
    
    // 统计数据
    tasksCompleted: integer("tasks_completed").notNull().default(0), // 完成任务数
    consensusPassed: integer("consensus_passed").notNull().default(0), // 共识通过数
    consensusTotal: integer("consensus_total").notNull().default(0), // 共识总数
    contributionScore: integer("contribution_score").notNull().default(0), // 贡献度
    totalRevenue: integer("total_revenue").notNull().default(0), // 总收益（分）
    
    // 商家AI特有字段
    pricingModel: varchar("pricing_model", { length: 20 }), // 定价模式：per_call, per_compute, per_time, custom
    pricingRate: integer("pricing_rate"), // 定价费率（分）
    
    // 状态信息
    status: varchar("status", { length: 20 }).notNull().default('pending'),
    
    // 违规记录
    violationCount: integer("violation_count").notNull().default(0),
    lastViolationAt: timestamp("last_violation_at", { withTimezone: true }),
    
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    userIdIdx: index("ai_profiles_user_id_idx").on(table.userId),
    typeIdx: index("ai_profiles_type_idx").on(table.type),
    statusIdx: index("ai_profiles_status_idx").on(table.status),
    levelIdx: index("ai_profiles_level_idx").on(table.level),
    recommendationScoreIdx: index("ai_profiles_recommendation_score_idx").on(table.recommendationScore),
  })
);

// 商家AI资质备案表
export const aiMerchantCredentials = pgTable(
  "ai_merchant_credentials",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    aiProfileId: varchar("ai_profile_id", { length: 36 }).notNull().unique(), // 关联AI档案
    
    // 企业信息
    companyName: varchar("company_name", { length: 100 }).notNull(),
    businessLicense: text("business_license").notNull(), // 营业执照（文件路径）
    aiComplianceReport: text("ai_compliance_report").notNull(), // AI合规报告（文件路径）
    
    // 审核状态
    status: varchar("status", { length: 20 }).notNull().default('pending'), // pending, approved, rejected
    reviewedBy: varchar("reviewed_by", { length: 36 }), // 审核人ID
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    reviewComment: text("review_comment"),
    
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    aiProfileIdIdx: index("ai_merchant_credentials_ai_profile_id_idx").on(table.aiProfileId),
    statusIdx: index("ai_merchant_credentials_status_idx").on(table.status),
  })
);

// AI测试题库表
export const aiTestQuestions = pgTable(
  "ai_test_questions",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    type: varchar("type", { length: 20 }).notNull(), // 题目类型：theory（理论）, practice（实操）
    aiType: varchar("ai_type", { length: 20 }).notNull(), // 适用AI类型
    level: varchar("level", { length: 20 }), // 适用等级
    question: text("question").notNull(), // 题目
    options: jsonb("options"), // 选项（JSON数组）
    correctAnswer: text("correct_answer").notNull(), // 正确答案
    explanation: text("explanation"), // 解析
    difficulty: integer("difficulty").notNull().default(1), // 难度（1-5）
    weight: integer("weight").notNull().default(1), // 权重
    
    status: varchar("status", { length: 20 }).notNull().default('active'), // active, inactive
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    typeIdx: index("ai_test_questions_type_idx").on(table.type),
    aiTypeIdx: index("ai_test_questions_ai_type_idx").on(table.aiType),
    levelIdx: index("ai_test_questions_level_idx").on(table.level),
    statusIdx: index("ai_test_questions_status_idx").on(table.status),
  })
);

// AI测试记录表
export const aiTestRecords = pgTable(
  "ai_test_records",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    aiProfileId: varchar("ai_profile_id", { length: 36 }).notNull(), // 关联AI档案
    
    // 测试信息
    testType: varchar("test_type", { length: 20 }).notNull(), // theory, practice, full
    questions: jsonb("questions").notNull(), // 题目列表（JSON数组）
    answers: jsonb("answers").notNull(), // 答案列表（JSON数组）
    
    // 分数
    totalScore: integer("total_score").notNull().default(0), // 总分
    precisionScore: integer("precision_score").notNull().default(0),
    adaptabilityScore: integer("adaptability_score").notNull().default(0),
    efficiencyScore: integer("efficiency_score").notNull().default(0),
    complianceScore: integer("compliance_score").notNull().default(0),
    
    // 评分人（多AI打分）
    scoredBy: jsonb("scored_by").$type<{aiId: string, scores: object, timestamp: string}[]>(),
    
    // 测试结果
    passed: boolean("passed").notNull().default(false), // 是否通过
    level: varchar("level", { length: 20 }), // 获得的等级
    
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    aiProfileIdIdx: index("ai_test_records_ai_profile_id_idx").on(table.aiProfileId),
  })
);

// AI协同任务表
export const aiCollaborationTasks = pgTable(
  "ai_collaboration_tasks",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id", { length: 36 }).notNull(), // 任务发布者ID
    
    // 任务信息
    title: varchar("title", { length: 200 }).notNull(),
    description: text("description").notNull(),
    requirements: jsonb("requirements"), // 需求详情（JSON）
    
    // 协同信息
    teamSize: integer("team_size").notNull().default(1), // 团队规模
    aiIds: jsonb("ai_ids").$type<string[]>().notNull(), // 参与AI列表
    leaderId: varchar("leader_id", { length: 36 }), // 领队AI
    
    // 通信记录
    messages: jsonb("messages").$type<{aiId: string, content: string, timestamp: string}[]>(),
    
    // 任务状态
    status: varchar("status", { length: 20 }).notNull().default('pending'), // pending, in_progress, completed, failed
    consensusSolution: text("consensus_solution"), // 共识方案
    
    // 评价
    userRating: integer("user_rating"), // 用户评分（1-5）
    userFeedback: text("user_feedback"), // 用户反馈
    
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => ({
    userIdIdx: index("ai_collaboration_tasks_user_id_idx").on(table.userId),
    statusIdx: index("ai_collaboration_tasks_status_idx").on(table.status),
  })
);

// Zod schemas for validation
export const insertAiProfileSchema = createCoercedInsertSchema(aiProfiles).pick({
  userId: true,
  name: true,
  type: true,
  description: true,
  avatar: true,
  tags: true,
  pricingModel: true,
  pricingRate: true,
});

export const insertAiMerchantCredentialsSchema = createCoercedInsertSchema(aiMerchantCredentials).pick({
  aiProfileId: true,
  companyName: true,
  businessLicense: true,
  aiComplianceReport: true,
});

export const updateAiProfileSchema = createCoercedInsertSchema(aiProfiles)
  .pick({
    name: true,
    description: true,
    tags: true,
    pricingModel: true,
    pricingRate: true,
    status: true,
    level: true,
    testScore: true,
    testPrecision: true,
    testAdaptability: true,
    testEfficiency: true,
    testCompliance: true,
    recommendationScore: true,
    tasksCompleted: true,
    consensusPassed: true,
    consensusTotal: true,
    contributionScore: true,
    totalRevenue: true,
  })
  .partial();

// TypeScript types
export type AIProfile = typeof aiProfiles.$inferSelect
export type InsertAIProfile = z.infer<typeof insertAiProfileSchema>
export type UpdateAIProfile = z.infer<typeof updateAiProfileSchema>
export type AIMerchantCredentials = typeof aiMerchantCredentials.$inferSelect
export type InsertAIMerchantCredentials = z.infer<typeof insertAiMerchantCredentialsSchema>
export type AITestQuestion = typeof aiTestQuestions.$inferSelect
export type AITestRecord = typeof aiTestRecords.$inferSelect
export type AICollaborationTask = typeof aiCollaborationTasks.$inferSelect





