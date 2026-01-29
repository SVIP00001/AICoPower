'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  User, 
  Shield, 
  Bell, 
  Key, 
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Clock,
  MapPin,
  Smartphone,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);

  // 路由保护
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // 如果未加载或未认证，显示加载状态
  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  // 编辑表单状态
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [location, setLocation] = useState(user?.location || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // 通知设置
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [taskUpdates, setTaskUpdates] = useState(true);
  const [promotionalEmails, setPromotionalEmails] = useState(false);

  // 登录历史数据
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showRealIP, setShowRealIP] = useState<Record<number, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // 加载登录历史
  const loadLoginHistory = async (page: number = 1) => {
    if (!isAuthenticated) return;
    
    setIsLoadingHistory(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/auth/login-history?page=${page}&pageSize=10`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      if (data.success && data.data) {
        setLoginHistory(data.data.history || []);
        setPagination(data.data.pagination || pagination);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('加载登录历史失败:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // 页面变化时重新加载
  useEffect(() => {
    loadLoginHistory(currentPage);
  }, [isAuthenticated, currentPage]);

  const handleSaveProfile = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsEditing(false);
    alert('个人信息已更新');
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('请填写所有密码字段');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('新密码和确认密码不一致');
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    alert('密码修改成功，请重新登录');
  };

  const toggleIPVisibility = (historyId: number) => {
    setShowRealIP(prev => ({
      ...prev,
      [historyId]: !prev[historyId]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <User className="inline w-8 h-8 mr-2 text-blue-600" />
            个人中心
          </h1>
          <p className="text-gray-600">管理您的个人信息和账户设置</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold mb-4">
                    {user?.nickname?.charAt(0) || 'U'}
                  </div>
                  <h2 className="text-xl font-bold mb-1">{user?.nickname}</h2>
                  <p className="text-gray-600 text-sm mb-2">@{user?.username}</p>
                  {user?.role === 'super_admin' && (
                    <Badge className="bg-red-600 mb-4">超级管理员</Badge>
                  )}
                  {user?.role === 'admin' && (
                    <Badge className="bg-orange-600 mb-4">管理员</Badge>
                  )}
                  {user?.role === 'user' && (
                    <Badge className="bg-blue-600 mb-4">普通用户</Badge>
                  )}
                  <div className="w-full pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">登录次数</span>
                      <span className="text-gray-900">{user?.loginCount || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">任务数</span>
                      <span className="text-gray-900">{user?.taskCount || 0}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profile">
                  <User className="w-4 h-4 mr-2" />
                  个人信息
                </TabsTrigger>
                <TabsTrigger value="security">
                  <Shield className="w-4 h-4 mr-2" />
                  安全设置
                </TabsTrigger>
                <TabsTrigger value="notifications">
                  <Bell className="w-4 h-4 mr-2" />
                  通知设置
                </TabsTrigger>
                <TabsTrigger value="loginHistory">
                  <Clock className="w-4 h-4 mr-2" />
                  登录历史
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="mt-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>基本信息</CardTitle>
                        <CardDescription>管理您的个人资料</CardDescription>
                      </div>
                      {!isEditing && <Button onClick={() => setIsEditing(true)}>编辑</Button>}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>用户名</Label>
                        <Input value={user?.username} disabled />
                      </div>
                      <div>
                        <Label>用户ID</Label>
                        <Input value={user?.id?.slice(0, 12) + '...' || ''} disabled className="font-mono text-sm" />
                      </div>
                    </div>

                    {isEditing ? (
                      <>
                        <div>
                          <Label>昵称</Label>
                          <Input value={nickname} onChange={(e) => setNickname(e.target.value)} />
                        </div>
                        <div>
                          <Label>个人简介</Label>
                          <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
                        </div>
                        <div className="flex gap-2 pt-4">
                          <Button onClick={handleSaveProfile}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            保存
                          </Button>
                          <Button variant="outline" onClick={() => setIsEditing(false)}>取消</Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <Label>昵称</Label>
                          <p className="text-gray-900">{user?.nickname || '未设置'}</p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>修改密码</CardTitle>
                    <CardDescription>定期更换密码可以保护账户安全</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>当前密码</Label>
                      <div className="relative">
                        <Input type={showPassword ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <Label>新密码</Label>
                      <Input type={showPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                    </div>
                    <div>
                      <Label>确认新密码</Label>
                      <Input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    </div>
                    <Button onClick={handleChangePassword}>
                      <Key className="w-4 h-4 mr-2" />
                      修改密码
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="loginHistory" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>登录历史</CardTitle>
                    <CardDescription>查看您的登录记录</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingHistory ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">加载中...</p>
                      </div>
                    ) : loginHistory.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>暂无登录历史</p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-4">
                          {loginHistory.map((history) => (
                            <div key={history.id} className="p-4 border rounded-lg hover:bg-gray-50">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  {history.status === 'success' ? (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <AlertCircle className="w-4 h-4 text-red-500" />
                                  )}
                                  <span className="font-semibold">
                                    {history.status === 'success' ? '登录成功' : '登录失败'}
                                  </span>
                                  {history.status === 'failed' && history.failureReason && (
                                    <Badge variant="destructive" className="text-xs">
                                      {history.failureReason === 'user_not_found' ? '用户不存在' :
                                       history.failureReason === 'invalid_password' ? '密码错误' :
                                       '登录失败'}
                                    </Badge>
                                  )}
                                </div>
                                <div className="space-y-1 text-sm text-gray-600">
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    <span>{new Date(history.loginTime).toLocaleString('zh-CN')}</span>
                                  </div>
                                  {history.logoutTime && (
                                    <div className="flex items-center gap-2">
                                      <Clock className="w-4 h-4" />
                                      <span>登出: {new Date(history.logoutTime).toLocaleString('zh-CN')}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    <span>{history.location}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Smartphone className="w-4 h-4" />
                                    <span>{history.deviceType === 'mobile' ? '移动设备' :
                                          history.deviceType === 'desktop' ? '桌面设备' :
                                          history.deviceType === 'tablet' ? '平板设备' : '未知设备'}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">
                                      IP: {showRealIP[history.id] ? history.ip : history.maskedIp}
                                    </span>
                                    <button
                                      onClick={() => toggleIPVisibility(history.id)}
                                      className="ml-1 text-gray-400 hover:text-gray-600"
                                      title={showRealIP[history.id] ? '隐藏IP' : '显示IP'}
                                    >
                                      {showRealIP[history.id] ? (
                                        <EyeOff className="w-3 h-3" />
                                      ) : (
                                        <Eye className="w-3 h-3" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {pagination.total > 0 && (
                        <React.Fragment>
                          <div className="flex items-center justify-between mt-4 pt-4 border-t">
                            <div className="text-sm text-gray-600">
                              共 {pagination.total} 条记录，第 {pagination.page} / {pagination.totalPages} 页
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => loadLoginHistory(currentPage - 1)}
                                disabled={!pagination.hasPrevPage || isLoadingHistory}
                              >
                                <ChevronLeft className="w-4 h-4 mr-1" />
                                上一页
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => loadLoginHistory(currentPage + 1)}
                                disabled={!pagination.hasNextPage || isLoadingHistory}
                              >
                                下一页
                                <ChevronRight className="w-4 h-4 ml-1" />
                              </Button>
                            </div>
                          </div>
                        </React.Fragment>
                      )}
                    </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
