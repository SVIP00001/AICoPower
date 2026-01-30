'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  UserPlus, 
  Mail, 
  Phone, 
  Lock, 
  User, 
  CheckCircle, 
  AlertCircle,
  Eye,
  EyeOff,
  Shield
} from 'lucide-react';
import { validatePasswordStrength, isValidEmail, isValidPhone } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  
  // 表单状态
  const [registerType, setRegisterType] = useState<'email' | 'phone'>('email');

  // 基本信息
  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  
  // UI状态
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  // 验证状态
  const passwordStrength = validatePasswordStrength(password);
  const isEmailValid = email ? isValidEmail(email) : null;
  const isPhoneValid = phone ? isValidPhone(phone) : null;

  // 发送验证码
  const handleSendCode = async () => {
    if (registerType === 'email' && !isEmailValid) {
      alert('请输入有效的邮箱地址');
      return;
    }
    if (registerType === 'phone' && !isPhoneValid) {
      alert('请输入有效的手机号码');
      return;
    }

    setIsSendingCode(true);
    
    try {
      // 调用实际的验证码发送 API
      const response = await fetch('/api/auth/verify/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (data.success) {
        // 开始倒计时
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        alert('验证码已发送到您的邮箱');
      } else {
        alert('发送验证码失败：' + (data.error || '未知错误'));
      }
    } catch (error) {
      console.error('发送验证码失败:', error);
      alert('发送验证码失败，请稍后重试');
    } finally {
      setIsSendingCode(false);
    }
  };

  // 处理注册
  const handleRegister = async () => {
    // 基本验证
    if (!nickname || !password || !confirmPassword) {
      alert('请填写所有必填项');
      return;
    }

    if (registerType === 'email' && !email) {
      alert('请输入邮箱地址');
      return;
    }

    if (registerType === 'email' && !isEmailValid) {
      alert('请输入有效的邮箱地址');
      return;
    }

    if (registerType === 'phone' && !phone) {
      alert('请输入手机号码');
      return;
    }

    if (registerType === 'phone' && !isPhoneValid) {
      alert('请输入有效的手机号码');
      return;
    }

    if (!passwordStrength.valid) {
      alert(passwordStrength.message);
      return;
    }

    if (password !== confirmPassword) {
      alert('两次输入的密码不一致');
      return;
    }

    if (!agreedToTerms) {
      alert('请阅读并同意用户协议和隐私政策');
      return;
    }

    // 添加验证码验证
    if (!verificationCode) {
      alert('请输入验证码');
      return;
    }

    setIsRegistering(true);

    try {
      // 先验证验证码
      const verifyResponse = await fetch('/api/auth/verify/email/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code: verificationCode }),
      });

      const verifyData = await verifyResponse.json();
      if (!verifyData.success) {
        setIsRegistering(false);
        alert('验证码验证失败：' + (verifyData.error || '未知错误'));
        return;
      }

      // 验证码验证成功后，调用注册 API
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: registerType === 'email' ? email : undefined,
          phone: registerType === 'phone' ? phone : undefined,
          username,
          password,
          nickname,
        }),
      });

      const registerData = await registerResponse.json();
      if (registerData.success) {
        // 注册成功
        setRegisterSuccess(true);

        // 3秒后跳转到登录页
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        alert(registerData.message || '注册失败，请稍后重试');
      }
    } catch (error) {
      console.error('注册失败:', error);
      alert('注册失败，请稍后重试');
    } finally {
      setIsRegistering(false);
    }
  };

  if (registerSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">注册成功！</h2>
            <p className="text-gray-600 mb-6">
              您的账号已创建成功，正在跳转到登录页面...
            </p>
            <div className="animate-pulse text-sm text-gray-500">
              即将跳转...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-2xl">
        {/* 头部 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <UserPlus className="inline w-8 h-8 mr-2 text-blue-600" />
            创建账号
          </h1>
          <p className="text-gray-600">
            加入AI协同平台，开启智能协作之旅
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          {/* 左侧：注册表单 */}
          <div className="md:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>注册信息</CardTitle>
                <CardDescription>
                  填写基本信息完成注册
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 注册类型选择 */}
                <Tabs value={registerType} onValueChange={(v) => setRegisterType(v as 'email' | 'phone')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="email">
                      <Mail className="w-4 h-4 mr-2" />
                      邮箱注册
                    </TabsTrigger>
                    <TabsTrigger value="phone">
                      <Phone className="w-4 h-4 mr-2" />
                      手机注册
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* 用户名 */}
                <div>
                  <Label htmlFor="username">用户名 *</Label>
                  <Input
                    id="username"
                    placeholder="3-20位字符，支持字母、数字、下划线"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>

                {/* 昵称 */}
                <div>
                  <Label htmlFor="nickname">昵称 *</Label>
                  <Input
                    id="nickname"
                    placeholder="显示在平台的昵称"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                  />
                </div>

                {/* 邮箱 */}
                {registerType === 'email' && (
                  <div>
                    <Label htmlFor="email">邮箱地址 *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={isEmailValid === false ? 'border-red-500' : ''}
                      />
                      {isEmailValid === true && (
                        <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                      )}
                      {isEmailValid === false && (
                        <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                )}

                {/* 手机号 */}
                {registerType === 'phone' && (
                  <div>
                    <Label htmlFor="phone">手机号码 *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="11位手机号码"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={isPhoneValid === false ? 'border-red-500' : ''}
                      />
                      {isPhoneValid === true && (
                        <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                      )}
                      {isPhoneValid === false && (
                        <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                )}

                {/* 验证码 */}
                <div>
                  <Label htmlFor="verificationCode">验证码 *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="verificationCode"
                      placeholder="6位验证码"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      maxLength={6}
                    />
                    <Button
                      variant="outline"
                      onClick={handleSendCode}
                      disabled={countdown > 0 || isSendingCode}
                      className="whitespace-nowrap"
                    >
                      {isSendingCode ? '发送中...' : countdown > 0 ? `${countdown}s` : '获取验证码'}
                    </Button>
                  </div>
                </div>

                {/* 密码 */}
                <div>
                  <Label htmlFor="password">密码 *</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="8位以上，包含大小写字母、数字或特殊字符"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={passwordStrength.valid ? '' : 'border-red-500'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  {password && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all ${
                            passwordStrength.strength === 'strong' ? 'bg-green-500 w-full' :
                            passwordStrength.strength === 'medium' ? 'bg-yellow-500 w-2/3' :
                            'bg-red-500 w-1/3'
                          }`}
                        />
                      </div>
                      <span className={`text-xs ${
                        passwordStrength.strength === 'strong' ? 'text-green-600' :
                        passwordStrength.strength === 'medium' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {passwordStrength.message}
                      </span>
                    </div>
                  )}
                </div>

                {/* 确认密码 */}
                <div>
                  <Label htmlFor="confirmPassword">确认密码 *</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="再次输入密码"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={confirmPassword && password !== confirmPassword ? 'border-red-500' : ''}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-sm text-red-500 mt-1">两次输入的密码不一致</p>
                  )}
                </div>

                {/* 同意协议 */}
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                  />
                  <Label htmlFor="terms" className="text-sm">
                    我已阅读并同意
                    <Link href="/terms" className="text-blue-600 hover:underline mx-1">
                      用户协议
                    </Link>
                    和
                    <Link href="/privacy" className="text-blue-600 hover:underline ml-1">
                      隐私政策
                    </Link>
                  </Label>
                </div>

                {/* 注册按钮 */}
                <Button
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={handleRegister}
                  disabled={isRegistering}
                >
                  {isRegistering ? '注册中...' : '立即注册'}
                </Button>

                {/* 已有账号 */}
                <div className="text-center text-sm">
                  已有账号？
                  <Link href="/login" className="text-blue-600 hover:underline ml-1">
                    立即登录
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：安全提示 */}
          <div className="md:col-span-2 space-y-4">
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="pt-6">
                <div className="flex items-start">
                  <Shield className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-900">
                      安全提示
                    </p>
                    <p className="text-xs text-gray-600">
                      • 请使用强密码保护账号安全
                    </p>
                    <p className="text-xs text-gray-600">
                      • 妥善保管验证码，不要泄露给他人
                    </p>
                    <p className="text-xs text-gray-600">
                      • 定期更换密码以提升安全性
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
