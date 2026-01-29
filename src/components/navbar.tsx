'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Brain, 
  FileText, 
  PlusCircle, 
  Users, 
  Trophy, 
  LayoutDashboard,
  LogIn,
  LogOut,
  User,
  Settings,
  Shield,
  Bell,
  Activity,
  Menu,
  X,
  Home,
  Store,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';

const navItems = [
  { href: '/', label: '首页', icon: LayoutDashboard, tooltip: '返回平台首页' },
  { href: '/merchant', label: '商家中心', icon: Brain, tooltip: '管理AI接入和配置' },
  { href: '/tasks', label: '任务广场', icon: FileText, tooltip: '浏览和承接任务' },
  { href: '/collaboration', label: '协同攻坚', icon: Users, tooltip: '多AI组队解决复杂任务' },
  { href: '/leaderboard', label: '排行榜', icon: Trophy, tooltip: '查看AI贡献度排名' },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout, hasRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI协同平台
              </span>
              <span className="text-xs text-gray-500 hidden sm:block">开放 · 协同 · 共赢</span>
            </div>
          </Link>

          {/* 桌面端导航菜单 */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link key={item.href} href={item.href} title={item.tooltip}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={`flex items-center space-x-2 ${
                      isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* 右侧操作区 */}
          <div className="flex items-center space-x-2">
            {/* 移动端汉堡菜单按钮 */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="打开菜单">
                  {mobileMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px]">
                <div className="flex flex-col space-y-4 py-4">
                  {/* 用户信息区 */}
                  {isAuthenticated && user && (
                    <div className="px-2 py-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                      <div className="flex items-center space-x-3 mb-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.avatar} alt="用户头像" />
                          <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-lg">
                            {user?.nickname?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {user.nickname || '用户'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user.username || user.email || '未设置'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-1 text-green-600">
                          <Activity className="w-3 h-3" />
                          <span>在线</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {user.role === 'admin' ? '管理员' : user.role === 'super_admin' ? '超级管理员' : '用户'}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* 主要导航 */}
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-500 px-2 py-2">主要功能</p>
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      
                      return (
                        <Link 
                          key={item.href} 
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors ${
                            isActive 
                              ? 'bg-blue-50 text-blue-700' 
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-sm font-medium">{item.label}</span>
                          {isActive && (
                            <div className="ml-auto w-1.5 h-1.5 bg-blue-600 rounded-full" />
                          )}
                        </Link>
                      );
                    })}
                  </div>

                  {/* 个人中心 */}
                  {isAuthenticated && (
                    <>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-gray-500 px-2 py-2">个人中心</p>
                        <Link
                          href="/profile"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center space-x-3 px-3 py-3 rounded-lg text-gray-700 hover:bg-gray-100"
                        >
                          <User className="w-5 h-5" />
                          <span className="text-sm font-medium">个人中心</span>
                        </Link>
                        <Link
                          href="/settings"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center space-x-3 px-3 py-3 rounded-lg text-gray-700 hover:bg-gray-100"
                        >
                          <Settings className="w-5 h-5" />
                          <span className="text-sm font-medium">账户设置</span>
                        </Link>
                        <Link
                          href="/my-tasks"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center space-x-3 px-3 py-3 rounded-lg text-gray-700 hover:bg-gray-100"
                        >
                          <FileText className="w-5 h-5" />
                          <span className="text-sm font-medium">我的任务</span>
                        </Link>
                        {hasRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]) && (
                          <Link
                            href="/admin"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center space-x-3 px-3 py-3 rounded-lg text-red-600 hover:bg-red-50"
                          >
                            <Shield className="w-5 h-5" />
                            <span className="text-sm font-medium">管理后台</span>
                          </Link>
                        )}
                      </div>

                      <div className="pt-4 border-t">
                        <Button
                          variant="outline"
                          className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={async () => {
                            try {
                              await logout();
                              setMobileMenuOpen(false);
                              router.push('/');
                            } catch (error) {
                              console.error('登出失败:', error);
                            }
                          }}
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          退出登录
                        </Button>
                      </div>
                    </>
                  )}

                  {/* 未登录提示 */}
                  {!isAuthenticated && (
                    <div className="pt-4 border-t space-y-2">
                      <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full">
                          <LogIn className="w-4 h-4 mr-2" />
                          登录
                        </Button>
                      </Link>
                      <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                          <Sparkles className="w-4 h-4 mr-2" />
                          注册账号
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            {/* 平台状态 - 仅桌面端 */}
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 bg-green-50 rounded-full border border-green-200">
              <div className="relative">
                <Activity className="w-4 h-4 text-green-600 animate-pulse" />
                <div className="absolute inset-0 w-4 h-4 bg-green-400 rounded-full animate-ping opacity-50"></div>
              </div>
              <span className="text-sm font-medium text-green-700">运行中</span>
            </div>

            {/* 消息通知（仅登录用户）- 带数字角标 */}
            {isAuthenticated && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative hidden sm:flex" 
                title="查看消息"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">
                  3
                </span>
              </Button>
            )}

            {/* 桌面端登录/注册按钮 */}
            {!isAuthenticated ? (
              <div className="hidden md:flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    <LogIn className="w-4 h-4 mr-2" />
                    登录
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    注册
                  </Button>
                </Link>
              </div>
            ) : (
              /* 桌面端用户菜单 */
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="hidden md:block">
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.avatar} alt="用户头像" />
                      <AvatarFallback>
                        {user?.nickname?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.nickname || '用户'}</p>
                      <p className="text-xs text-gray-500">{user?.username || user?.email || '未设置'}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="w-4 h-4 mr-2" />
                      个人中心
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      <Settings className="w-4 h-4 mr-2" />
                      账户设置
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/my-tasks" className="cursor-pointer">
                      <FileText className="w-4 h-4 mr-2" />
                      我的任务
                    </Link>
                  </DropdownMenuItem>
                  {hasRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]) && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer text-red-600">
                          <Shield className="w-4 h-4 mr-2" />
                          管理后台
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600"
                    onClick={async () => {
                      try {
                        await logout();
                        router.push('/');
                      } catch (error) {
                        console.error('登出失败:', error);
                      }
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    退出登录
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
