'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, UserStatus } from '@/types/auth';

// API 响应类型
interface LoginResponse {
  success: boolean;
  message?: string;
  data?: {
    user: User;
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresAt: string;
      refreshTokenExpiresAt: string;
    };
  };
}

interface RegisterResponse {
  success: boolean;
  message?: string;
  data?: {
    user: User;
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresAt: string;
      refreshTokenExpiresAt: string;
    };
  };
}

interface MeResponse {
  success: boolean;
  data?: {
    user: User;
  };
}

// 存储键
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  TOKEN_EXPIRES_AT: 'tokenExpiresAt',
  REFRESH_TOKEN_EXPIRES_AT: 'refreshTokenExpiresAt',
  USER: 'currentUser',
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 初始化时检查本地存储中的登录状态
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        const savedUser = localStorage.getItem(STORAGE_KEYS.USER);

        if (!accessToken || !refreshToken) {
          setIsLoading(false);
          return;
        }

        // 如果有 token 但没有用户信息，先标记为登录状态，尝试重新获取用户信息
        let userToSet: User | null = null;

        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser);

            // 基本的验证，确保有 id 和 role 字段
            if (parsedUser && typeof parsedUser === 'object' && parsedUser.id) {
              // 创建安全的用户对象，为所有字段提供默认值
              userToSet = {
                id: parsedUser.id,
                username: parsedUser.username,
                email: parsedUser.email,
                phone: parsedUser.phone,
                passwordHash: parsedUser.passwordHash || '',
                avatar: parsedUser.avatar,
                nickname: parsedUser.nickname || '用户',
                bio: parsedUser.bio,
                location: parsedUser.location,
                role: parsedUser.role || 'user',
                status: parsedUser.status || 'active',
                emailVerified: !!parsedUser.emailVerified,
                phoneVerified: !!parsedUser.phoneVerified,
                twoFactorEnabled: !!parsedUser.twoFactorEnabled,
                createdAt: parsedUser.createdAt || Date.now(),
                updatedAt: parsedUser.updatedAt || Date.now(),
                lastLoginAt: parsedUser.lastLoginAt,
                lastLoginIp: parsedUser.lastLoginIp,
                shardId: parsedUser.shardId || 0,
                taskCount: parsedUser.taskCount || 0,
                loginCount: parsedUser.loginCount || 0,
                merchantProfile: parsedUser.merchantProfile,
                consumerProfile: parsedUser.consumerProfile,
              };
            }
          } catch (parseError) {
            console.error('Failed to parse user data:', parseError);
            // 解析失败，不使用缓存的用户数据，但保持登录状态
          }
        }

        // 设置用户对象（即使为 null，也保持登录状态）
        setUser(userToSet);

        // 检查 token 是否过期
        const tokenExpiresAt = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRES_AT);
        if (tokenExpiresAt && new Date(tokenExpiresAt) < new Date()) {
          // Token 已过期，尝试刷新
          await refreshTokenAction();
          return;
        }

        // 不再自动调用 API 验证 token，避免重复请求和状态更新
        // 登录时已经验证过，token 验证在需要时（如调用 API）进行
      } catch (error) {
        console.error('Failed to check auth:', error);
        clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // 刷新 token
  const refreshTokenAction = async (): Promise<boolean> => {
    if (isRefreshing) return false;

    setIsRefreshing(true);
    try {
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

      if (!refreshToken) {
        clearAuthData();
        return false;
      }

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data: LoginResponse = await response.json();

      if (data.success && data.data) {
        // 更新 token
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.data.tokens.accessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.data.tokens.refreshToken);
        localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRES_AT, data.data.tokens.expiresAt);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN_EXPIRES_AT, data.data.tokens.refreshTokenExpiresAt);

        // 更新用户信息
        setUser(data.data.user);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.data.user));

        return true;
      } else {
        clearAuthData();
        return false;
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
      clearAuthData();
      return false;
    } finally {
      setIsRefreshing(false);
    }
  };

  // 登录
  const login = async (identifier: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emailOrPhone: identifier, password }),
      });

      const data: LoginResponse = await response.json();

      if (data.success && data.data) {
        // 保存 token
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.data.tokens.accessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.data.tokens.refreshToken);
        localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRES_AT, data.data.tokens.expiresAt);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN_EXPIRES_AT, data.data.tokens.refreshTokenExpiresAt);

        // 确保用户数据格式正确
        const safeUser: User = {
          id: data.data.user.id,
          username: data.data.user.username,
          email: data.data.user.email,
          phone: data.data.user.phone,
          passwordHash: data.data.user.passwordHash || '',
          avatar: data.data.user.avatar,
          nickname: data.data.user.nickname || '用户',
          bio: data.data.user.bio,
          location: data.data.user.location,
          role: data.data.user.role,
          status: data.data.user.status,
          emailVerified: !!data.data.user.emailVerified,
          phoneVerified: !!data.data.user.phoneVerified,
          twoFactorEnabled: !!data.data.user.twoFactorEnabled,
          createdAt: data.data.user.createdAt || Date.now(),
          updatedAt: data.data.user.updatedAt || Date.now(),
          lastLoginAt: data.data.user.lastLoginAt,
          lastLoginIp: data.data.user.lastLoginIp,
          shardId: data.data.user.shardId || 0,
          taskCount: data.data.user.taskCount || 0,
          loginCount: data.data.user.loginCount || 0,
          merchantProfile: data.data.user.merchantProfile,
          consumerProfile: data.data.user.consumerProfile,
        };

        // 保存用户信息
        setUser(safeUser);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(safeUser));

        return { success: true };
      } else {
        return { success: false, error: data.message || '登录失败' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: '登录失败，请稍后重试' };
    }
  };

  // 登出
  const logout = async () => {
    try {
      const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

      if (accessToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthData();
    }
  };

  // 清除认证数据
  const clearAuthData = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRES_AT);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN_EXPIRES_AT);
    localStorage.removeItem(STORAGE_KEYS.USER);
  };

  const hasRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
