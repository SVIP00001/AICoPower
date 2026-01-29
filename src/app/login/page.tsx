'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  LogIn,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Shield
} from 'lucide-react';
import { isValidEmail, isValidPhone } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const hasRedirected = useRef(false); // 使用 ref 避免触发重渲染
  
  // 所有状态 Hooks 必须在早期返回之前调用
  // 表单状态
  const [loginType, setLoginType] = useState<'email' | 'phone'>('email');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // UI状态
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  // 监听登录状态变化，登录成功后统一跳转到首页
  useEffect(() => {
    // 使用 ref 避免无限重渲染
    if (isAuthenticated && !hasRedirected.current && !authLoading) {
      hasRedirected.current = true;

      // 使用 setTimeout 确保在下一个事件循环中执行跳转
      const redirectTimer = setTimeout(() => {
        try {
          router.push('/');
        } catch (navError) {
          console.error('导航失败:', navError);
          // 强制刷新页面
          window.location.href = '/';
        }
      }, 100);

      // 清理定时器
      return () => clearTimeout(redirectTimer);
    }
  }, [isAuthenticated, authLoading, router]); // 移除 isRedirecting 依赖

  // 如果正在加载认证状态，显示加载中
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  // 如果已登录，显示跳转中
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">登录成功，正在跳转...</p>
        </div>
      </div>
    );
  }
  
  // 验证状态
  const isEmailValid = identifier ? isValidEmail(identifier) : null;
  const isPhoneValid = identifier ? isValidPhone(identifier) : null;

  // 处理登录
  const handleLogin = async () => {
    // 基本验证
    if (!identifier || !password) {
      setLoginError('请输入登录凭证和密码');
      return;
    }

    if (loginType === 'email' && !isEmailValid) {
      setLoginError('请输入有效的邮箱地址');
      return;
    }

    if (loginType === 'phone' && !isPhoneValid) {
      setLoginError('请输入有效的手机号码');
      return;
    }

    setIsLoggingIn(true);
    setLoginError('');

    try {
      const result = await login(identifier, password);

      if (result.success) {
        // 登录成功，等待 AuthContext 更新后跳转
        // 这里的跳转由 useEffect 处理（在组件顶部）
      } else {
        setLoginError(result.error || '登录失败，请检查用户名和密码');
      }
    } catch (error) {
      setLoginError('登录失败，请稍后重试');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-2xl">
        {/* 头部 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <LogIn className="inline w-8 h-8 mr-2 text-blue-600" />
            欢迎登录
          </h1>
          <p className="text-gray-600">
            登录AI协同平台，继续您的智能协作之旅
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          {/* 左侧：登录表单 */}
          <div className="md:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>账号登录</CardTitle>
                <CardDescription>
                  使用邮箱或手机号登录
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 登录类型选择 */}
                <Tabs value={loginType} onValueChange={(v: any) => setLoginType(v)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="email">
                      <Mail className="w-4 h-4 mr-2" />
                      邮箱登录
                    </TabsTrigger>
                    <TabsTrigger value="phone">
                      <Phone className="w-4 h-4 mr-2" />
                      手机登录
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* 错误提示 */}
                {loginError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{loginError}</p>
                  </div>
                )}

                {/* 邮箱/手机号 */}
                <div>
                  <Label htmlFor="identifier">
                    {loginType === 'email' ? '邮箱地址' : '手机号码'} *
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="identifier"
                      type={loginType === 'email' ? 'email' : 'tel'}
                      placeholder={
                        loginType === 'email' 
                          ? 'your@email.com' 
                          : '11位手机号码'
                      }
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className={
                        (loginType === 'email' && isEmailValid === false) ||
                        (loginType === 'phone' && isPhoneValid === false)
                          ? 'border-red-500'
                          : ''
                      }
                    />
                    {loginType === 'email' && isEmailValid === true && (
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    )}
                    {loginType === 'email' && isEmailValid === false && (
                      <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                    )}
                    {loginType === 'phone' && isPhoneValid === true && (
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    )}
                    {loginType === 'phone' && isPhoneValid === false && (
                      <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                    )}
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
                        placeholder="请输入密码"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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
                </div>

                {/* 记住我 & 忘记密码 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    />
                    <Label htmlFor="remember" className="text-sm cursor-pointer">
                      记住我
                    </Label>
                  </div>
                  <Link 
                    href="/forgot-password" 
                    className="text-sm text-blue-600 hover:underline"
                  >
                    忘记密码？
                  </Link>
                </div>

                {/* 登录按钮 */}
                <Button
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? '登录中...' : '登录'}
                </Button>

                {/* 注册入口 */}
                <div className="text-center text-sm">
                  还没有账号？
                  <Link href="/register" className="text-blue-600 hover:underline ml-1">
                    立即注册
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：其他登录方式 */}
          <div className="md:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">其他登录方式</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" disabled>
                  <div className="w-5 h-5 rounded bg-blue-500 mr-2" />
                  微信登录
                </Button>
                <Button variant="outline" className="w-full justify-start" disabled>
                  <div className="w-5 h-5 rounded bg-green-500 mr-2" />
                  支付宝登录
                </Button>
                <Button variant="outline" className="w-full justify-start" disabled>
                  <div className="w-5 h-5 rounded bg-blue-600 mr-2" />
                  企业微信登录
                </Button>
                <Button variant="outline" className="w-full justify-start" disabled>
                  <div className="w-5 h-5 rounded bg-red-600 mr-2" />
                  钉钉登录
                </Button>
              </CardContent>
              <div className="px-6 pb-6">
                <div className="text-xs text-gray-500 text-center">
                  更多登录方式即将推出
                </div>
              </div>
            </Card>

            {/* 安全提示 */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start">
                  <Shield className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-900">
                      登录安全提示
                    </p>
                    <p className="text-xs text-gray-600">
                      • 请在安全的环境下登录
                    </p>
                    <p className="text-xs text-gray-600">
                      • 不要在公共设备上记住密码
                    </p>
                    <p className="text-xs text-gray-600">
                      • 登录异常时请及时修改密码
                    </p>
                    <p className="text-xs text-gray-600">
                      • 建议开启双因素认证（2FA）
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 平台信息 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">平台规模</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">注册用户</span>
                    <Badge className="bg-blue-600">28.47亿</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">接入AI</span>
                    <Badge className="bg-purple-600">284.7万</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">完成任务</span>
                    <Badge className="bg-green-600">1.59亿</Badge>
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
