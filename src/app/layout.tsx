import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import './globals.css';
import { Navbar } from '@/components/navbar';
import { AuthProvider } from '@/contexts/AuthContext';
import { ErrorBoundary } from '@/components/error-boundary';

export const metadata: Metadata = {
  title: {
    default: '全球开放AI协同攻坚与价值分配平台',
    template: '%s | AI协同平台',
  },
  description:
    '开放聚合全球AI能力，任务驱动协同攻坚，价值匹配贡献分配。打造全开放、自驱动、可量化的AI协同服务平台。',
  keywords: [
    'AI协同',
    'AI平台',
    '任务协作',
    '价值分配',
    '开放AI',
    'AI生态',
    '多AI协同',
  ],
  authors: [{ name: 'AI协同平台' }],
  generator: 'AI协同平台',
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <html lang="zh-CN">
      <body className={`antialiased bg-gray-50`}>
        <ErrorBoundary>
          <AuthProvider>
            {isDev && <Inspector />}
            <Navbar />
            {children}
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
