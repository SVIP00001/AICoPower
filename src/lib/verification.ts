import nodemailer from 'nodemailer';

// 生成 6 位验证码
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 发送邮箱验证码
export async function sendEmailVerification(email: string, code: string): Promise<boolean> {
  try {
    // 创建邮件传输器
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 邮件选项
    const mailOptions = {
      from: process.env.EMAIL_USER || '',
      to: email,
      subject: '邮箱验证 - AICoPower',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">邮箱验证</h2>
          <p>您好！</p>
          <p>感谢您注册 AICoPower 账号。请使用以下验证码完成邮箱验证：</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="text-align: center; font-size: 24px; color: #333;">${code}</h3>
          </div>
          <p>此验证码有效期为 10 分钟，请及时使用。</p>
          <p>如果您没有注册 AICoPower 账号，请忽略此邮件。</p>
          <p>祝好！</p>
          <p>AICoPower 团队</p>
        </div>
      `
    };

    // 发送邮件
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('发送邮箱验证码失败:', error);
    return false;
  }
}

// 验证验证码是否有效
export function verifyCode(code: string, storedCode: string, expiresAt: Date): boolean {
  if (!code || !storedCode) {
    return false;
  }
  
  if (code !== storedCode) {
    return false;
  }
  
  if (new Date() > expiresAt) {
    return false;
  }
  
  return true;
}
