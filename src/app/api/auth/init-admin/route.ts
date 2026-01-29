import { NextRequest, NextResponse } from 'next/server';
import { authManager } from '@/storage/database';
import { hashPassword } from '@/lib/password';

// 初始化超级管理员账号
export async function POST(request: NextRequest) {
  try {
    // 检查是否已存在超级管理员
    const existingSuperAdmin = await authManager.getUserByEmail('superadmin@platform.com');

    if (existingSuperAdmin) {
      return NextResponse.json(
        { success: false, message: '超级管理员已存在，无需重复初始化' },
        { status: 400 }
      );
    }

    // 哈希密码
    const hashedPassword = await hashPassword('Super@Admin2026');

    // 创建超级管理员
    const superAdmin = await authManager.createUser({
      username: 'superadmin',
      email: 'superadmin@platform.com',
      phone: '13800000000',
      password: hashedPassword,
      nickname: '超级管理员',
      role: 'super_admin',
    });

    // 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = superAdmin;

    return NextResponse.json(
      {
        success: true,
        message: '超级管理员初始化成功',
        data: { user: userWithoutPassword },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Init admin error:', error);
    return NextResponse.json(
      {
        success: false,
        message: '初始化失败，请稍后重试',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
