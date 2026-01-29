/**
 * 用户角色枚举
 */
export enum UserRole {
  SUPER_ADMIN = 'super_admin',      // 超级管理员
  ADMIN = 'admin',                  // 管理员
  USER = 'user',                    // 普通用户（既可以是消费者也可以是商家）
}

/**
 * 用户状态枚举
 */
export enum UserStatus {
  ACTIVE = 'active',                // 活跃
  INACTIVE = 'inactive',            // 未激活
  SUSPENDED = 'suspended',          // 暂停
  BANNED = 'banned',                // 封禁
  DELETED = 'deleted',              // 已删除
}

/**
 * 用户基本信息（用于分库分表）
 * 使用雪花算法生成用户ID，确保全球唯一
 */
export interface User {
  id: string;                       // 用户ID（雪花算法生成的64位整数转字符串）
  username?: string;                // 用户名（可选）
  email?: string;                   // 邮箱（加密存储）
  phone?: string;                   // 手机号（加密存储）
  passwordHash: string;             // 密码哈希（bcrypt）
  avatar?: string;                  // 头像URL
  nickname: string;                 // 昵称
  bio?: string;                     // 个人简介
  location?: string;                // 所在地
  role: UserRole;                   // 用户角色
  status: UserStatus;               // 用户状态
  emailVerified: boolean;           // 邮箱是否验证
  phoneVerified: boolean;           // 手机是否验证
  twoFactorEnabled: boolean;        // 是否开启双因素认证
  
  // 时间戳（使用Unix时间戳，便于分片）
  createdAt: number;                // 创建时间
  updatedAt: number;                // 更新时间
  lastLoginAt?: number;             // 最后登录时间
  lastLoginIp?: string;             // 最后登录IP
  
  // 分片信息（用于路由到不同的数据库）
  shardId: number;                  // 分片ID（0-9999，支持10000个分片）
  
  // 统计信息（高频访问，可缓存在Redis）
  taskCount: number;                // 发布/承接的任务数
  loginCount: number;               // 登录次数
  
  // 商家/消费者扩展信息（存储在独立的扩展表）
  merchantProfile?: MerchantProfile;
  consumerProfile?: ConsumerProfile;
}

/**
 * 商家扩展信息（存储在独立的merchant_profiles表）
 */
export interface MerchantProfile {
  userId: string;                   // 关联用户ID
  businessName: string;             // 企业/个人名称
  businessLicense?: string;         // 营业执照（加密存储）
  creditScore: number;              // 信用评分（0-1000）
  totalRevenue: number;             // 总收益（分为单位）
  aiCount: number;                  // 接入的AI数量
  revenueShare: number;             // 收益分成比例（%）
  
  // 合同和资质
  contractSigned: boolean;          // 是否签署合同
  contractSignedAt?: number;        // 合同签署时间
  
  createdAt: number;
  updatedAt: number;
}

/**
 * 消费者扩展信息（存储在独立的consumer_profiles表）
 */
export interface ConsumerProfile {
  userId: string;                   // 关联用户ID
  balance: number;                  // 账户余额（分为单位）
  totalSpent: number;               // 总消费（分为单位）
  taskCount: number;                // 发布的任务数
  
  // 偏好设置
  preferredAiMode: 'auto' | 'specific'; // 偏好的AI模式
  privacyLevel: 'public' | 'private';   // 隐私级别
  
  createdAt: number;
  updatedAt: number;
}

/**
 * 登录令牌（JWT Payload）
 */
export interface AuthTokenPayload {
  userId: string;
  role: UserRole;
  shardId: number;
  exp: number;
  iat: number;
}

/**
 * 刷新令牌（存储在Redis中）
 */
export interface RefreshToken {
  token: string;
  userId: string;
  deviceId: string;                 // 设备ID
  createdAt: number;
  expiresAt: number;
  revoked: boolean;
}

/**
 * 登录历史记录（用于安全审计）
 */
export interface LoginHistory {
  id: string;
  userId: string;
  loginTime: number;
  logoutTime?: number;
  ip: string;
  userAgent: string;
  deviceType: string;               // web, mobile, desktop
  location?: string;                // 地理位置
  status: 'success' | 'failed';
  failureReason?: string;
}

/**
 * 会话信息（存储在Redis中）
 */
export interface Session {
  sessionId: string;
  userId: string;
  role: UserRole;
  shardId: number;
  deviceInfo: {
    deviceId: string;
    userAgent: string;
    ip: string;
  };
  createdAt: number;
  expiresAt: number;
  lastActiveAt: number;
}

/**
 * 权限定义
 */
export interface Permission {
  resource: string;                 // 资源名称（如 'user', 'task', 'ai'）
  action: string;                   // 操作（如 'create', 'read', 'update', 'delete'）
  scope?: string;                   // 作用域（如 'own', 'all'）
}

/**
 * 角色权限映射
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: [
    // 超级管理员拥有所有权限
    { resource: '*', action: '*' },
  ],
  [UserRole.ADMIN]: [
    // 管理员权限
    { resource: 'user', action: 'read', scope: 'all' },
    { resource: 'user', action: 'update', scope: 'all' },
    { resource: 'task', action: 'read', scope: 'all' },
    { resource: 'task', action: 'update', scope: 'all' },
    { resource: 'ai', action: 'read', scope: 'all' },
    { resource: 'ai', action: 'update', scope: 'all' },
  ],
  [UserRole.USER]: [
    // 普通用户权限（既可以发布任务，也可以接入AI）
    { resource: 'task', action: 'create', scope: 'own' },
    { resource: 'task', action: 'read', scope: 'own' },
    { resource: 'task', action: 'update', scope: 'own' },
    { resource: 'task', action: 'delete', scope: 'own' },
    { resource: 'ai', action: 'create', scope: 'own' },
    { resource: 'ai', action: 'read', scope: 'own' },
    { resource: 'ai', action: 'update', scope: 'own' },
    { resource: 'ai', 'action': 'delete', scope: 'own' },
    { resource: 'task', action: 'accept', scope: 'all' },
    { resource: 'revenue', action: 'read', scope: 'own' },
    { resource: 'profile', action: 'update', scope: 'own' },
  ],
};

/**
 * 检查权限
 */
export function hasPermission(
  role: UserRole,
  resource: string,
  action: string,
  scope?: string
): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  
  // 检查超级权限
  if (permissions.some(p => p.resource === '*' && p.action === '*')) {
    return true;
  }
  
  // 检查具体权限
  return permissions.some(p => 
    p.resource === resource && 
    p.action === action && 
    (!scope || !p.scope || p.scope === scope)
  );
}
