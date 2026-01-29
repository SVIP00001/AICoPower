'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Cpu,
  BarChart3,
  Settings,
  Shield,
  AlertTriangle,
  CheckCircle,
  TrendingUp
} from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalAIs: 0,
    totalTasks: 0,
  });
  const [systemStatus, setSystemStatus] = useState({
    api: '正常',
    database: '正常',
    storage: '正常',
    ai: '正常',
  });

  useEffect(() => {
    if (!isAuthenticated || (user?.role !== 'super_admin' && user?.role !== 'admin')) {
      router.push('/');
      return;
    }

    // 从 API 获取真实统计数据
    const accessToken = localStorage.getItem('accessToken');
    fetch('/api/admin/stats', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setStats(data.data.stats);
          if (data.data.systemStatus) {
            setSystemStatus(data.data.systemStatus);
          }
        }
      })
      .catch((error) => {
        console.error('获取统计数据失败:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (user.role !== 'super_admin' && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">权限不足</h3>
            <p className="text-gray-600 mb-4">您没有权限访问管理后台</p>
            <Button onClick={() => router.push('/')}>返回首页</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载统计数据...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* 页面头部 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {user.role === 'super_admin' ? '超级管理后台' : '管理后台'}
          </h1>
          <p className="text-gray-600">
            欢迎回来，{user.nickname || user.username || '管理员'}
          </p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总用户数</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                +12% 较上月
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">活跃用户</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeUsers}</div>
              <p className="text-xs text-muted-foreground">
                +8% 较上月
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">接入 AI</CardTitle>
              <Cpu className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAIs}</div>
              <p className="text-xs text-muted-foreground">
                +5 较上周
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总任务数</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTasks}</div>
              <p className="text-xs text-muted-foreground">
                +23 较上周
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 功能区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 系统状态 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                系统状态
              </CardTitle>
              <CardDescription>当前平台运行状态</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API 服务</span>
                <Badge className="bg-green-100 text-green-800">{systemStatus.api}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">数据库</span>
                <Badge className="bg-green-100 text-green-800">{systemStatus.database}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">存储服务</span>
                <Badge className="bg-green-100 text-green-800">{systemStatus.storage}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">AI 模型</span>
                <Badge className="bg-green-100 text-green-800">{systemStatus.ai}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* 快捷操作 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                快捷操作
              </CardTitle>
              <CardDescription>常用管理功能</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/admin/users')}>
                <Users className="mr-2 h-4 w-4" />
                用户管理
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/admin/ai')}>
                <Cpu className="mr-2 h-4 w-4" />
                AI 管理
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/admin/tasks')}>
                <BarChart3 className="mr-2 h-4 w-4" />
                任务管理
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/admin/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                系统设置
              </Button>
            </CardContent>
          </Card>

          {/* 安全警告 */}
          {user.role === 'super_admin' && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  安全提示
                </CardTitle>
                <CardDescription>超级管理员注意事项</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 mr-2" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">重要提醒</h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>作为超级管理员，您拥有系统的最高权限。请谨慎操作，注意以下事项：</p>
                        <ul className="mt-2 list-disc list-inside space-y-1">
                          <li>删除操作不可恢复，请确认后再执行</li>
                          <li>定期检查系统日志，监控异常活动</li>
                          <li>保持管理员账号的安全，定期更换密码</li>
                          <li>备份重要数据，防止数据丢失</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
