import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { users } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';
import { generateVerificationCode, sendEmailVerification } from '@/lib/verification';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    const db = await getDb();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: '请提供有效的邮箱地址' },
        { status: 400 }
      );
    }

    // 生成验证码
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 分钟过期

    // 查找用户
    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (user) {
      // 如果用户存在，更新用户验证信息
      await db.update(users)
        .set({
          verificationCode: code,
          verificationExpires: expiresAt,
        })
        .where(eq(users.email, email));
    }
    // 如果用户不存在，我们仍然发送验证码
    // 验证码将在注册时通过其他方式验证

    // 发送验证码
    const sent = await sendEmailVerification(email, code);

    if (!sent) {
      return NextResponse.json(
        { success: false, error: '发送验证码失败，请稍后重试' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '验证码已发送到您的邮箱',
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('发送邮箱验证码失败:', error);
    return NextResponse.json(
      { success: false, error: '服务器错误，请稍后重试' },
      { status: 500 }
    );
  }
}
