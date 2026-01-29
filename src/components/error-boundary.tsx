'use client';

import { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full border-2 border-red-200">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-red-700">应用程序错误</CardTitle>
                  <CardDescription>
                    很抱歉，应用程序遇到了一个意外错误
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {this.state.error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-semibold text-red-800 mb-2">错误信息：</p>
                  <p className="text-sm text-red-700 font-mono">
                    {this.state.error.message}
                  </p>
                  {this.state.errorInfo && this.state.errorInfo.componentStack && (
                    <details className="mt-3">
                      <summary className="text-sm font-semibold text-red-800 cursor-pointer">
                        查看详细信息
                      </summary>
                      <pre className="mt-2 text-xs text-red-600 overflow-auto max-h-40">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              <div className="text-sm text-gray-600">
                <p className="mb-2">您可以尝试以下操作：</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>刷新页面</li>
                  <li>返回首页重新开始</li>
                  <li>清除浏览器缓存和本地存储</li>
                  <li>如果问题持续，请联系技术支持</li>
                </ul>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={this.handleReload}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  刷新页面
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex-1 border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  <Home className="w-4 h-4 mr-2" />
                  返回首页
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
