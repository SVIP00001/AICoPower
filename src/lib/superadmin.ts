import { User, UserRole, UserStatus, MerchantProfile, ConsumerProfile } from '@/types/auth';
import { generateUserId, hashPassword, calculateShardId } from '@/lib/auth';

/**
 * 超级管理员初始数据
 * 默认账号：admin@aiplatform.com
 * 默认密码：Admin@123456
 * 
 * ⚠️ 重要提示：生产环境部署后必须立即修改默认密码！
 */
export const SUPER_ADMIN_CONFIG = {
  email: 'admin@aiplatform.com',
  username: 'superadmin',
  password: 'Admin@123456', // 实际部署时请立即修改
  
  // 超级管理员信息
  profile: {
    nickname: '系统超级管理员',
    avatar: '/avatars/superadmin.png',
  },
  
  // 管理员权限说明
  description: '拥有系统所有权限，负责系统管理、用户管理、AI管理等核心操作',
  
  // 安全提示
  securityNotes: [
    '请首次登录后立即修改默认密码',
    '建议开启双因素认证（2FA）',
    '定期更换密码，使用强密码',
    '不要将管理员账号信息泄露给他人',
  ],
};

/**
 * 创建超级管理员账号
 */
export async function createSuperAdmin(): Promise<User> {
  const userId = generateUserId();
  const shardId = calculateShardId(userId);
  const now = Date.now();
  
  const passwordHash = await hashPassword(SUPER_ADMIN_CONFIG.password);
  
  const user: User = {
    id: userId,
    username: SUPER_ADMIN_CONFIG.username,
    email: SUPER_ADMIN_CONFIG.email,
    passwordHash,
    nickname: SUPER_ADMIN_CONFIG.profile.nickname,
    avatar: SUPER_ADMIN_CONFIG.profile.avatar,
    role: UserRole.SUPER_ADMIN,
    status: UserStatus.ACTIVE,
    emailVerified: true,
    phoneVerified: false,
    twoFactorEnabled: false,
    
    createdAt: now,
    updatedAt: now,
    lastLoginAt: undefined,
    lastLoginIp: undefined,
    
    shardId,
    
    taskCount: 0,
    loginCount: 0,
  };
  
  return user;
}

/**
 * 系统管理员列表（预配置）
 */
export const SYSTEM_ADMINS = [
  {
    email: 'admin@aiplatform.com',
    username: 'superadmin',
    role: UserRole.SUPER_ADMIN,
    description: '超级管理员',
  },
  {
    email: 'ops@aiplatform.com',
    username: 'opsadmin',
    role: UserRole.ADMIN,
    description: '运维管理员',
  },
  {
    email: 'security@aiplatform.com',
    username: 'securityadmin',
    role: UserRole.ADMIN,
    description: '安全管理员',
  },
];

/**
 * 管理员权限说明文档
 */
export const ADMIN_PERMISSIONS_GUIDE = {
  [UserRole.SUPER_ADMIN]: {
    title: '超级管理员权限',
    permissions: [
      '用户管理：查看、编辑、删除所有用户',
      '角色管理：创建、修改、删除角色和权限',
      'AI管理：管理所有AI账号，包括审核、禁用等',
      '任务管理：查看、编辑、删除所有任务',
      '财务管理：查看所有财务数据，处理提现申请',
      '系统配置：修改系统配置、维护系统',
      '安全审计：查看所有操作日志、安全事件',
      '数据管理：管理数据库、执行数据备份恢复',
    ],
    limitations: '无限制权限',
  },
  [UserRole.ADMIN]: {
    title: '普通管理员权限',
    permissions: [
      '用户管理：查看、编辑普通用户（不包括超级管理员）',
      'AI管理：管理AI账号（不包括删除）',
      '任务管理：查看、编辑任务（不包括删除）',
      '内容审核：审核任务内容、AI回复',
      '日志查看：查看操作日志',
    ],
    limitations: '不能删除用户、不能修改系统配置、不能删除任务',
  },
};

/**
 * 初始化系统管理数据
 */
export async function initializeSystemAdmin() {
  console.log('🔐 初始化超级管理员系统...');
  
  const superAdmin = await createSuperAdmin();
  
  console.log('✅ 超级管理员创建成功:');
  console.log(`   用户ID: ${superAdmin.id}`);
  console.log(`   用户名: ${superAdmin.username}`);
  console.log(`   邮箱: ${superAdmin.email}`);
  console.log(`   角色: ${superAdmin.role}`);
  console.log(`   分片ID: ${superAdmin.shardId}`);
  console.log('');
  console.log('⚠️  默认登录信息:');
  console.log(`   邮箱: ${SUPER_ADMIN_CONFIG.email}`);
  console.log(`   密码: ${SUPER_ADMIN_CONFIG.password}`);
  console.log('');
  console.log('🔒 安全提示:');
  SUPER_ADMIN_CONFIG.securityNotes.forEach(note => {
    console.log(`   • ${note}`);
  });
  
  return superAdmin;
}

/**
 * 获取管理员统计信息
 */
export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  totalAIs: number;
  totalTasks: number;
  totalRevenue: number;
  pendingTasks: number;
  activeSessions: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

/**
 * 模拟获取管理员统计数据
 * 实际生产环境应该从数据库和缓存中获取
 */
export async function getAdminStats(): Promise<AdminStats> {
  // 模拟数据 - 实际应该从数据库查询
  return {
    totalUsers: 2847000000, // 28.47亿
    activeUsers: 1256000000, // 12.56亿
    newUsersToday: 8765000,  // 876.5万
    totalAIs: 2847000,       // 284.7万
    totalTasks: 158930000,   // 1.5893亿
    totalRevenue: 2840000000, // 284亿（元）
    pendingTasks: 125000,
    activeSessions: 450000000, // 4.5亿
    systemHealth: 'healthy',
  };
}

/**
 * 系统健康检查
 */
export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  services: {
    database: { status: 'up' | 'down'; latency: number };
    redis: { status: 'up' | 'down'; latency: number };
    api: { status: 'up' | 'down'; latency: number };
    storage: { status: 'up' | 'down'; used: number; total: number };
  };
  metrics: {
    cpu: number;
    memory: number;
    disk: number;
  };
  uptime: number;
}

/**
 * 模拟系统健康检查
 */
export async function checkSystemHealth(): Promise<SystemHealth> {
  return {
    status: 'healthy',
    services: {
      database: { status: 'up', latency: 5 },
      redis: { status: 'up', latency: 2 },
      api: { status: 'up', latency: 10 },
      storage: { status: 'up', used: 45.6, total: 100 }, // 45.6TB / 100TB
    },
    metrics: {
      cpu: 35.2,
      memory: 68.5,
      disk: 45.6,
    },
    uptime: 1209600, // 14天（秒）
  };
}
