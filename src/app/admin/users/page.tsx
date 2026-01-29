'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import {
  Users,
  Search,
  MoreVertical,
  Shield,
  ShieldAlert,
  Power,
  Key,
  LogOut,
  Eye,
  Loader2,
  RefreshCw,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface User {
  id: string;
  username: string;
  email: string;
  phone: string | null;
  nickname: string;
  avatar: string | null;
  role: string;
  status: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
  taskCount: number;
  loginCount: number;
  createdAt: string;
  lastLoginAt: string | null;
  lastLoginIp: string | null;
  isOnline: boolean;
}

interface UserDetail extends User {
  aiCount: number;
  taskCount: number;
}

interface LoginHistory {
  id: number;
  loginTime: string;
  logoutTime: string | null;
  ip: string;
  maskedIp: string;
  deviceType: string;
  userAgent: string;
  location: string;
  status: string;
  failureReason: string | null;
}

export default function UserManagementPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  });

  // 筛选条件
  const [filters, setFilters] = useState({
    status: 'all',
    role: 'all',
    keyword: '',
  });

  // 用户详情弹窗
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [historyPagination, setHistoryPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });

  // 操作加载状态
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // 删除确认对话框
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: string; username: string; nickname: string } | null>(null);

  useEffect(() => {
    if (!isAuthenticated || (user?.role !== 'super_admin' && user?.role !== 'admin')) {
      router.push('/');
      return;
    }
    loadUsers();
  }, [isAuthenticated, user, router]);

  const loadUsers = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString(),
        status: filters.status,
        role: filters.role,
        keyword: filters.keyword,
      });

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setUsers(data.data.users);
        setPagination(data.data.pagination);
      } else {
        toast.error(data.message || '加载用户列表失败');
      }
    } catch (error) {
      console.error('加载用户列表失败:', error);
      toast.error('加载用户列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination({ ...pagination, page: newPage });
    loadUsers();
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
    setPagination({ ...pagination, page: 1 }); // 重置到第一页
  };

  const handleSearch = () => {
    setPagination({ ...pagination, page: 1 });
    loadUsers();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleViewDetail = async (userId: string) => {
    setIsLoadingDetail(true);
    setIsDetailDialogOpen(true);

    try {
      const accessToken = localStorage.getItem('accessToken');

      // 获取用户详情
      const userResponse = await fetch(`/api/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const userData = await userResponse.json();

      if (userData.success) {
        setSelectedUser(userData.data.user);

        // 获取登录历史
        const historyResponse = await fetch(
          `/api/admin/users/${userId}/login-history?page=1&pageSize=10`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const historyData = await historyResponse.json();

        if (historyData.success) {
          setLoginHistory(historyData.data.history);
          setHistoryPagination(historyData.data.pagination);
        }
      } else {
        toast.error(userData.message || '加载用户详情失败');
        setIsDetailDialogOpen(false);
      }
    } catch (error) {
      console.error('加载用户详情失败:', error);
      toast.error('加载用户详情失败');
      setIsDetailDialogOpen(false);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleUpdateStatus = async (userId: string, newStatus: string) => {
    setActionLoading(userId);
    try {
      const accessToken = localStorage.getItem('accessToken');

      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        loadUsers();
      } else {
        toast.error(data.message || '更新用户状态失败');
      }
    } catch (error) {
      console.error('更新用户状态失败:', error);
      toast.error('更新用户状态失败');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetPassword = async (userId: string, username: string) => {
    if (!confirm(`确定要重置用户 ${username} 的密码吗？\n新密码将设置为：${username}123456`)) {
      return;
    }

    setActionLoading(userId);
    try {
      const accessToken = localStorage.getItem('accessToken');

      const response = await fetch(`/api/admin/users/${userId}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`密码已重置为：${data.data.newPassword}`);
      } else {
        toast.error(data.message || '重置密码失败');
      }
    } catch (error) {
      console.error('重置密码失败:', error);
      toast.error('重置密码失败');
    } finally {
      setActionLoading(null);
    }
  };

  const handleForceLogout = async (userId: string, username: string) => {
    if (!confirm(`确定要强制下线用户 ${username} 吗？\n这将吊销该用户的所有会话。`)) {
      return;
    }

    setActionLoading(userId);
    try {
      const accessToken = localStorage.getItem('accessToken');

      const response = await fetch(`/api/admin/users/${userId}/force-logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        loadUsers();
      } else {
        toast.error(data.message || '强制下线失败');
      }
    } catch (error) {
      console.error('强制下线失败:', error);
      toast.error('强制下线失败');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setActionLoading(userToDelete.id);
    try {
      const accessToken = localStorage.getItem('accessToken');

      const response = await fetch(`/api/admin/users/${userToDelete.id}/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        setDeleteDialogOpen(false);
        setUserToDelete(null);
        loadUsers();
      } else {
        toast.error(data.message || '删除用户失败');
      }
    } catch (error) {
      console.error('删除用户失败:', error);
      toast.error('删除用户失败');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: '正常', color: 'bg-green-100 text-green-800' },
      inactive: { label: '未激活', color: 'bg-gray-100 text-gray-800' },
      suspended: { label: '暂停', color: 'bg-yellow-100 text-yellow-800' },
      banned: { label: '已封禁', color: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;

    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      super_admin: { label: '超级管理员', color: 'bg-purple-100 text-purple-800' },
      admin: { label: '管理员', color: 'bg-blue-100 text-blue-800' },
      user: { label: '普通用户', color: 'bg-gray-100 text-gray-800' },
    };

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.user;

    return <Badge className={config.color}>{config.label}</Badge>;
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
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
            <ShieldAlert className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">权限不足</h3>
            <p className="text-gray-600 mb-4">您没有权限访问用户管理</p>
            <Button onClick={() => router.push('/')}>返回首页</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* 页面头部 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <Users className="inline w-8 h-8 mr-2 text-blue-600" />
            用户管理
          </h1>
          <p className="text-gray-600">
            管理平台用户，包括启用、禁用、重置密码、强制下线等操作
          </p>
        </div>

        {/* 筛选区域 */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">状态</label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部</SelectItem>
                    <SelectItem value="active">正常</SelectItem>
                    <SelectItem value="inactive">未激活</SelectItem>
                    <SelectItem value="suspended">暂停</SelectItem>
                    <SelectItem value="banned">已封禁</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">角色</label>
                <Select
                  value={filters.role}
                  onValueChange={(value) => handleFilterChange('role', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择角色" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部</SelectItem>
                    <SelectItem value="super_admin">超级管理员</SelectItem>
                    <SelectItem value="admin">管理员</SelectItem>
                    <SelectItem value="user">普通用户</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-2 block">搜索</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="搜索用户名、邮箱或昵称"
                    value={filters.keyword}
                    onChange={(e) => handleFilterChange('keyword', e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                  />
                  <Button onClick={handleSearch}>
                    <Search className="w-4 h-4 mr-2" />
                    搜索
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 用户列表 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>用户列表</span>
              <Button variant="outline" size="sm" onClick={loadUsers}>
                <RefreshCw className="w-4 h-4 mr-2" />
                刷新
              </Button>
            </CardTitle>
            <CardDescription>
              共 {pagination.total} 个用户，当前显示第 {pagination.page} 页
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                暂无用户数据
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>用户</TableHead>
                        <TableHead>角色</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>在线</TableHead>
                        <TableHead>登录次数</TableHead>
                        <TableHead>注册时间</TableHead>
                        <TableHead>最后登录</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((userItem) => (
                        <TableRow key={userItem.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                {userItem.nickname?.[0] || userItem.username[0]}
                              </div>
                              <div>
                                <div className="font-medium">{userItem.nickname || userItem.username}</div>
                                <div className="text-sm text-gray-500">{userItem.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getRoleBadge(userItem.role)}</TableCell>
                          <TableCell>{getStatusBadge(userItem.status)}</TableCell>
                          <TableCell>
                            {userItem.isOnline ? (
                              <Badge className="bg-green-100 text-green-800">在线</Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-800">离线</Badge>
                            )}
                          </TableCell>
                          <TableCell>{userItem.loginCount}</TableCell>
                          <TableCell>
                            {formatDistanceToNow(new Date(userItem.createdAt), {
                              addSuffix: true,
                              locale: zhCN,
                            })}
                          </TableCell>
                          <TableCell>
                            {userItem.lastLoginAt ? (
                              <div className="text-sm">
                                <div>
                                  {formatDistanceToNow(new Date(userItem.lastLoginAt), {
                                    addSuffix: true,
                                    locale: zhCN,
                                  })}
                                </div>
                                <div className="text-gray-500">{userItem.lastLoginIp}</div>
                              </div>
                            ) : (
                              <span className="text-gray-500">从未登录</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" disabled={actionLoading === userItem.id}>
                                  {actionLoading === userItem.id ? (
                                    <Loader2 className="animate-spin h-4 w-4" />
                                  ) : (
                                    <MoreVertical className="h-4 w-4" />
                                  )}
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>操作</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleViewDetail(userItem.id)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  查看详情
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {userItem.status === 'active' ? (
                                  <DropdownMenuItem onClick={() => handleUpdateStatus(userItem.id, 'banned')}>
                                    <ShieldAlert className="w-4 h-4 mr-2" />
                                    禁用用户
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => handleUpdateStatus(userItem.id, 'active')}>
                                    <Shield className="w-4 h-4 mr-2" />
                                    启用用户
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => handleResetPassword(userItem.id, userItem.username)}>
                                  <Key className="w-4 h-4 mr-2" />
                                  重置密码
                                </DropdownMenuItem>
                                {userItem.isOnline && (
                                  <DropdownMenuItem onClick={() => handleForceLogout(userItem.id, userItem.username)}>
                                    <LogOut className="w-4 h-4 mr-2" />
                                    强制下线
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    setUserToDelete({
                                      id: userItem.id,
                                      username: userItem.username,
                                      nickname: userItem.nickname,
                                    });
                                    setDeleteDialogOpen(true);
                                  }}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  删除用户
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* 分页 */}
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-600">
                    共 {pagination.total} 个用户，第 {pagination.page} / {pagination.totalPages} 页
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                    >
                      上一页
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                    >
                      下一页
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 用户详情弹窗 */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>用户详情</DialogTitle>
            <DialogDescription>
              {selectedUser ? `${selectedUser.nickname || selectedUser.username} 的详细信息` : ''}
            </DialogDescription>
          </DialogHeader>

          {isLoadingDetail ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
            </div>
          ) : selectedUser ? (
            <div className="space-y-6">
              {/* 基本信息 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">用户名</label>
                  <div className="text-lg font-semibold">{selectedUser.username}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">昵称</label>
                  <div className="text-lg font-semibold">{selectedUser.nickname || '-'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">邮箱</label>
                  <div className="text-lg font-semibold">{selectedUser.email}</div>
                  {selectedUser.emailVerified && (
                    <Badge className="bg-green-100 text-green-800 mt-1">已验证</Badge>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">手机号</label>
                  <div className="text-lg font-semibold">{selectedUser.phone || '-'}</div>
                  {selectedUser.phone && selectedUser.phoneVerified && (
                    <Badge className="bg-green-100 text-green-800 mt-1">已验证</Badge>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">角色</label>
                  <div>{getRoleBadge(selectedUser.role)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">状态</label>
                  <div>{getStatusBadge(selectedUser.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">在线状态</label>
                  <div>
                    {selectedUser.isOnline ? (
                      <Badge className="bg-green-100 text-green-800">在线</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800">离线</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">双因子认证</label>
                  <div>
                    {selectedUser.twoFactorEnabled ? (
                      <Badge className="bg-green-100 text-green-800">已启用</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800">未启用</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* 统计数据 */}
              <div className="grid grid-cols-3 gap-4 border-t pt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>发布AI数量</CardDescription>
                    <CardTitle className="text-2xl">{selectedUser.aiCount}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>发布任务数量</CardDescription>
                    <CardTitle className="text-2xl">{selectedUser.taskCount}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>登录次数</CardDescription>
                    <CardTitle className="text-2xl">{selectedUser.loginCount}</CardTitle>
                  </CardHeader>
                </Card>
              </div>

              {/* 登录历史 */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">最近登录历史</h3>
                {loginHistory.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">暂无登录记录</div>
                ) : (
                  <div className="space-y-2">
                    {loginHistory.map((history) => (
                      <div key={history.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">
                              {formatDistanceToNow(new Date(history.loginTime), {
                                addSuffix: true,
                                locale: zhCN,
                              })}
                            </span>
                            <Badge
                              variant={history.status === 'success' ? 'default' : 'destructive'}
                              className="text-xs"
                            >
                              {history.status === 'success' ? '成功' : '失败'}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            IP: {history.maskedIp} | 设备: {history.deviceType}
                          </div>
                          {history.failureReason && (
                            <div className="text-sm text-red-600">
                              失败原因: {history.failureReason}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              确认删除用户
            </DialogTitle>
            <DialogDescription>
              您确定要删除用户 <span className="font-bold text-gray-900">{userToDelete?.nickname || userToDelete?.username}</span> 吗？
              <br />
              此操作将永久删除该用户及其所有相关数据，无法恢复！
            </DialogDescription>
          </DialogHeader>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-700">
                <p className="font-semibold mb-1">删除将包含以下内容：</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>用户基本信息</li>
                  <li>所有登录会话</li>
                  <li>登录历史记录</li>
                  <li>审计日志</li>
                  <li>发布AI数量记录</li>
                  <li>发布任务数量记录</li>
                </ul>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setUserToDelete(null);
              }}
              disabled={actionLoading !== null}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={actionLoading !== null}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  删除中...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  确认删除
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
