import { eq, and, desc, SQL, or, sql } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import { verifyAccessToken } from "@/lib/jwt";
import {
  users,
  sessions,
  loginHistory,
  auditLogs,
  insertUserSchema,
  updateUserSchema,
  insertSessionSchema,
  insertLoginHistorySchema,
  insertAuditLogSchema,
  type User,
  type InsertUser,
  type UpdateUser,
  type Session,
  type InsertSession,
  type LoginHistory,
  type InsertLoginHistory,
  type AuditLog,
  type InsertAuditLog,
} from "./shared/schema";

export class AuthManager {
  // ==================== 用户管理 ====================

  async createUser(data: InsertUser): Promise<User> {
    const db = await getDb();
    const validated = insertUserSchema.parse(data);
    const [user] = await db.insert(users).values(validated).returning();
    return user;
  }

  async getUserById(id: string): Promise<User | null> {
    const db = await getDb();
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const db = await getDb();
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || null;
  }

  async getUserByPhone(phone: string): Promise<User | null> {
    const db = await getDb();
    const [user] = await db.select().from(users).where(eq(users.phone, phone));
    return user || null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const db = await getDb();
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || null;
  }

  async getUserByEmailOrPhone(emailOrPhone: string): Promise<User | null> {
    const db = await getDb();
    const [user] = await db
      .select()
      .from(users)
      .where(or(eq(users.email, emailOrPhone), eq(users.phone, emailOrPhone)));
    return user || null;
  }

  async updateUser(id: string, data: UpdateUser): Promise<User | null> {
    const db = await getDb();
    const validated = updateUserSchema.parse(data);
    const [user] = await db
      .update(users)
      .set({ ...validated, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || null;
  }

  async incrementLoginCount(id: string): Promise<void> {
    const db = await getDb();
    await db
      .update(users)
      .set({
        loginCount: sql`${users.loginCount} + 1`,
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));
  }

  // ==================== 会话管理 ====================

  async createSession(data: InsertSession): Promise<Session> {
    const db = await getDb();
    const validated = insertSessionSchema.parse(data);
    const [session] = await db.insert(sessions).values(validated).returning();
    return session;
  }

  async getSessionBySessionId(sessionId: string): Promise<Session | null> {
    const db = await getDb();
    const [session] = await db
      .select()
      .from(sessions)
      .where(and(eq(sessions.sessionId, sessionId), eq(sessions.revoked, false)));
    return session || null;
  }

  async getSessionByToken(token: string): Promise<Session | null> {
    const db = await getDb();
    const [session] = await db
      .select()
      .from(sessions)
      .where(and(eq(sessions.token, token), eq(sessions.revoked, false)));
    return session || null;
  }

  async getSessionByRefreshToken(refreshToken: string): Promise<Session | null> {
    const db = await getDb();
    const [session] = await db
      .select()
      .from(sessions)
      .where(and(eq(sessions.refreshToken, refreshToken), eq(sessions.revoked, false)));
    return session || null;
  }

  async updateSessionLastActive(sessionId: string): Promise<void> {
    const db = await getDb();
    await db
      .update(sessions)
      .set({ lastActiveAt: new Date() })
      .where(eq(sessions.sessionId, sessionId));
  }

  async revokeSession(sessionId: string): Promise<boolean> {
    const db = await getDb();
    const result = await db
      .update(sessions)
      .set({ revoked: true })
      .where(eq(sessions.sessionId, sessionId));
    return (result.rowCount ?? 0) > 0;
  }

  async revokeAllUserSessions(userId: string): Promise<number> {
    const db = await getDb();
    const result = await db
      .update(sessions)
      .set({ revoked: true })
      .where(eq(sessions.userId, userId));
    return result.rowCount ?? 0;
  }

  async deleteExpiredSessions(): Promise<number> {
    const db = await getDb();
    const now = new Date();
    const result = await db.delete(sessions).where(eq(sessions.expiresAt, now));
    return result.rowCount ?? 0;
  }

  // ==================== 登录历史管理 ====================

  async createLoginHistory(data: InsertLoginHistory): Promise<LoginHistory> {
    const db = await getDb();
    const validated = insertLoginHistorySchema.parse(data);
    const [history] = await db.insert(loginHistory).values(validated).returning();
    return history;
  }

  async getLoginHistoryByUserId(userId: string, limit: number = 50): Promise<LoginHistory[]> {
    const db = await getDb();
    return db
      .select()
      .from(loginHistory)
      .where(eq(loginHistory.userId, userId))
      .orderBy(desc(loginHistory.loginTime))
      .limit(limit);
  }

  async updateLogoutTime(historyId: number): Promise<void> {
    const db = await getDb();
    await db.update(loginHistory).set({ logoutTime: new Date() }).where(eq(loginHistory.id, historyId));
  }

  // ==================== 审计日志管理 ====================

  async createAuditLog(data: InsertAuditLog): Promise<AuditLog> {
    const db = await getDb();
    const validated = insertAuditLogSchema.parse(data);
    const [log] = await db.insert(auditLogs).values(validated).returning();
    return log;
  }

  async getAuditLogsByUserId(userId: string, limit: number = 100): Promise<AuditLog[]> {
    const db = await getDb();
    return db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.userId, userId))
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit);
  }

  async getAuditLogsByAction(action: string, limit: number = 100): Promise<AuditLog[]> {
    const db = await getDb();
    return db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.action, action))
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit);
  }

  async getAuditLogsByResource(resource: string, limit: number = 100): Promise<AuditLog[]> {
    const db = await getDb();
    return db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.resource, resource))
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit);
  }

  // ==================== Token验证 ====================

  /**
   * 验证JWT令牌
   * 
   * @param token JWT令牌
   * @returns 令牌payload
   * @throws 验证失败时抛出错误
   */
  verifyToken(token: string) {
    return verifyAccessToken(token);
  }
}

export const authManager = new AuthManager();
