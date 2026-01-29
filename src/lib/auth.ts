import crypto from 'crypto';

/**
 * 密码加密（使用 bcrypt，这里简化为模拟）
 * 实际生产环境应该使用 bcrypt 或 argon2
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
    .toString('hex');
  return `${salt}:${hash}`;
}

/**
 * 验证密码
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const [salt, hash] = hashedPassword.split(':');
  if (!salt || !hash) return false;
  
  const verifyHash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
    .toString('hex');
  return hash === verifyHash;
}

/**
 * 雪花算法生成ID（支持分布式环境）
 * 用于生成全球唯一的用户ID
 */
class SnowflakeIdGenerator {
  private sequence: number = 0;
  private lastTimestamp: number = 0;
  private readonly workerId: number;
  private readonly datacenterId: number;
  
  // 时间起始点（2025-01-01）
  private readonly epoch = 1735689600000;
  private readonly workerIdBits = 5;
  private readonly datacenterIdBits = 5;
  private readonly sequenceBits = 12;
  
  constructor(workerId: number = 1, datacenterId: number = 1) {
    this.workerId = workerId;
    this.datacenterId = datacenterId;
  }
  
  generate(): string {
    let timestamp = Date.now();
    
    if (timestamp < this.lastTimestamp) {
      throw new Error('Clock moved backwards');
    }
    
    if (timestamp === this.lastTimestamp) {
      this.sequence = (this.sequence + 1) & ((1 << this.sequenceBits) - 1);
      if (this.sequence === 0) {
        timestamp = this.waitNextMillis(this.lastTimestamp);
      }
    } else {
      this.sequence = 0;
    }
    
    this.lastTimestamp = timestamp;
    
    const datacenterIdShift = this.workerIdBits + this.sequenceBits;
    const timestampShift = this.datacenterIdBits + this.workerIdBits + this.sequenceBits;
    
    const id = 
      ((BigInt(timestamp - this.epoch) << BigInt(timestampShift)) |
      (BigInt(this.datacenterId) << BigInt(datacenterIdShift)) |
      (BigInt(this.workerId) << BigInt(this.sequenceBits)) |
      BigInt(this.sequence));
    
    return id.toString();
  }
  
  private waitNextMillis(lastTimestamp: number): number {
    let timestamp = Date.now();
    while (timestamp <= lastTimestamp) {
      timestamp = Date.now();
    }
    return timestamp;
  }
}

// 单例实例
const snowflakeGenerator = new SnowflakeIdGenerator();

/**
 * 生成用户ID
 */
export function generateUserId(): string {
  return snowflakeGenerator.generate();
}

/**
 * 生成会话ID
 */
export function generateSessionId(): string {
  return crypto.randomUUID();
}

/**
 * 生成设备ID
 */
export function generateDeviceId(): string {
  return crypto.randomUUID();
}

/**
 * 计算分片ID（用于分库分表路由）
 * 支持最多10000个分片，每个分片约1000万用户
 */
export function calculateShardId(userId: string): number {
  // 取用户ID的最后4位数字作为分片ID
  const last4Digits = parseInt(userId.slice(-4));
  return last4Digits % 10000;
}

/**
 * 生成JWT令牌（简化版）
 * 实际生产环境应该使用jsonwebtoken库
 */
export function generateAccessToken(payload: {
  userId: string;
  role: string;
  shardId: number;
}): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24; // 24小时过期
  const iat = Math.floor(Date.now() / 1000);
  
  const body = btoa(JSON.stringify({
    ...payload,
    exp,
    iat,
  }));
  
  const signature = crypto
    .createHmac('sha256', process.env.JWT_SECRET || 'your-secret-key')
    .update(`${header}.${body}`)
    .digest('base64');
  
  return `${header}.${body}.${signature}`;
}

/**
 * 生成刷新令牌
 */
export function generateRefreshToken(): string {
  return crypto.randomUUID();
}

/**
 * 验证访问令牌（简化版）
 */
export function verifyAccessToken(token: string): {
  userId: string;
  role: string;
  shardId: number;
  exp: number;
} | null {
  try {
    const [header, body, signature] = token.split('.');
    if (!header || !body || !signature) return null;
    
    // 验证签名
    const expectedSignature = crypto
      .createHmac('sha256', process.env.JWT_SECRET || 'your-secret-key')
      .update(`${header}.${body}`)
      .digest('base64');
    
    if (signature !== expectedSignature) return null;
    
    const payload = JSON.parse(atob(body));
    
    // 检查过期
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return payload;
  } catch {
    return null;
  }
}

/**
 * 加密敏感信息（邮箱、手机号）
 */
export function encryptData(data: string): string {
  const algorithm = 'aes-256-cbc';
  const key = Buffer.from(process.env.ENCRYPTION_KEY || 'your-32-byte-encryption-key!', 'utf8');
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * 解密敏感信息
 */
export function decryptData(encryptedData: string): string {
  const algorithm = 'aes-256-cbc';
  const key = Buffer.from(process.env.ENCRYPTION_KEY || 'your-32-byte-encryption-key!', 'utf8');
  
  const [ivHex, encrypted] = encryptedData.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * 验证邮箱格式
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 验证手机号格式（中国大陆）
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
}

/**
 * 验证密码强度
 */
export function validatePasswordStrength(password: string): {
  valid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  message: string;
} {
  if (password.length < 8) {
    return { valid: false, strength: 'weak', message: '密码长度至少8位' };
  }
  
  let score = 0;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  
  if (score < 2) {
    return { valid: false, strength: 'weak', message: '密码强度过弱，请包含大小写字母、数字或特殊字符' };
  }
  
  if (score < 3) {
    return { valid: true, strength: 'medium', message: '密码强度中等' };
  }
  
  return { valid: true, strength: 'strong', message: '密码强度良好' };
}

/**
 * 获取用户IP地址
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  return '0.0.0.0';
}

/**
 * 获取用户代理
 */
export function getUserAgent(request: Request): string {
  return request.headers.get('user-agent') || 'Unknown';
}

/**
 * 检测设备类型
 */
export function detectDeviceType(userAgent: string): 'mobile' | 'desktop' | 'tablet' | 'unknown' {
  const ua = userAgent.toLowerCase();
  
  if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile|wpdesktop/i.test(ua)) {
    return 'mobile';
  }
  
  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    return 'tablet';
  }
  
  if (/windows|macintosh|linux|x11/i.test(ua)) {
    return 'desktop';
  }
  
  return 'unknown';
}

/**
 * 速率限制键
 */
export function getRateLimitKey(identifier: string, action: string): string {
  return `ratelimit:${action}:${identifier}`;
}

/**
 * 验证码生成
 */
export function generateVerificationCode(length: number = 6): string {
  const digits = '0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += digits[Math.floor(Math.random() * digits.length)];
  }
  return code;
}
