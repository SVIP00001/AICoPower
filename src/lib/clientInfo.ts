import { NextRequest } from 'next/server';

/**
 * 根据 UserAgent 识别设备类型
 */
export function detectDeviceType(userAgent: string): 'web' | 'mobile' | 'desktop' | 'tablet' | 'unknown' {
  const ua = userAgent.toLowerCase();

  // 平板设备
  if (/ipad|tablet|kindle|silk/i.test(ua)) {
    return 'tablet';
  }

  // 移动设备
  if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile|windows phone/i.test(ua)) {
    return 'mobile';
  }

  // 如果有桌面操作系统的标识，或者没有明确的移动标识，则认为是桌面设备
  if (/windows|macintosh|linux|x11/i.test(ua)) {
    return 'desktop';
  }

  // 命令行工具（curl, wget等）默认归类为桌面设备
  if (/curl|wget|httpie|python-requests|go-http-client|java/i.test(ua)) {
    return 'desktop';
  }

  return 'unknown';
}

/**
 * 解析 UserAgent 获取浏览器信息
 */
export function parseUserAgent(userAgent: string): { browser: string; os: string } {
  const ua = userAgent.toLowerCase();

  // 浏览器检测
  let browser = '未知';
  if (ua.includes('chrome')) browser = 'Chrome';
  else if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('safari')) browser = 'Safari';
  else if (ua.includes('edge')) browser = 'Edge';
  else if (ua.includes('opera')) browser = 'Opera';

  // 操作系统检测
  let os = '未知';
  if (ua.includes('windows')) os = 'Windows';
  else if (ua.includes('mac')) os = 'macOS';
  else if (ua.includes('linux')) os = 'Linux';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) os = 'iOS';

  return { browser, os };
}

/**
 * IP地址脱敏
 */
export function maskIP(ip: string): string {
  if (!ip) return '未知';
  // IPv4: 192.168.1.100 -> 192.168.1.***
  if (ip.includes('.')) {
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.***`;
    }
  }
  // IPv6: 脱敏后几位
  if (ip.includes(':')) {
    const parts = ip.split(':');
    const visibleParts = parts.slice(0, -2).join(':');
    return visibleParts ? `${visibleParts}:***` : '***';
  }
  return ip;
}

/**
 * 根据 IP 地址获取地理位置（模拟实现）
 * 实际生产环境应该使用 IP 地址定位服务，如：
 * - 高德地图 IP 定位 API
 * - 百度地图 IP 定位 API
 * - ipinfo.io
 * - ip-api.com
 */
export async function getLocationByIP(ip: string): Promise<string> {
  if (!ip || ip === '::1' || ip === '127.0.0.1') {
    return '本地';
  }

  // 模拟地理位置（实际应该调用真实的 IP 定位服务）
  try {
    // 这里使用简单的判断逻辑
    // 实际项目中应该调用第三方 API
    const domesticIPs = [
      '117', '218', '114', '119', '120', '121', '122', '123', '124', '125',
      '61', '162', '106', '110', '111', '112', '113', '115', '116', '118',
      '223', '42', '27', '36', '39', '49', '58', '59', '60', '101', '103',
      '104', '106', '107', '108', '109', '110', '111', '112', '113', '114'
    ];

    const firstOctet = ip.split('.')[0];
    if (domesticIPs.includes(firstOctet)) {
      return '中国';
    }

    return '海外';
  } catch (error) {
    console.error('获取IP位置失败:', error);
    return '未知';
  }
}

/**
 * 获取客户端详细信息
 */
export function getClientInfo(request: NextRequest): {
  ip: string;
  userAgent: string;
  deviceType: 'web' | 'mobile' | 'desktop' | 'tablet' | 'unknown';
} {
  // 获取真实IP（考虑代理）
  const xForwardedFor = request.headers.get('x-forwarded-for');
  const xRealIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');

  const ip = xForwardedFor?.split(',')[0]?.trim() ||
             xRealIp ||
             cfConnectingIp ||
             '127.0.0.1';

  const userAgent = request.headers.get('user-agent') || '';

  const deviceType = detectDeviceType(userAgent);

  return { ip, userAgent, deviceType };
}
