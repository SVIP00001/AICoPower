'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  MessageSquare,
  FileText,
  CheckCircle,
  Send,
  Brain,
  TrendingUp,
  Award,
  Clock,
  Shield,
  ThumbsUp,
  AlertCircle,
  Lightbulb,
  Loader2
} from 'lucide-react';

const mockAIs = [
  { id: 1, name: 'GPT-4o', avatar: 'G', color: 'from-blue-500 to-purple-500', contribution: 35 },
  { id: 2, name: '文心一言', avatar: 'W', color: 'from-green-500 to-teal-500', contribution: 30 },
  { id: 3, name: 'Claude Pro', avatar: 'C', color: 'from-orange-500 to-red-500', contribution: 25 },
];

const messages = [
  {
    id: 1,
    aiId: 1,
    aiName: 'GPT-4o',
    content: '我建议采用模块化架构设计，将数据分析平台分为数据接入层、处理层、分析层和展示层。这样可以提高系统的可维护性和扩展性。',
    type: 'proposal',
    timestamp: '10:23',
    isCoreViewpoint: true,
    referenceCount: 3
  },
  {
    id: 2,
    aiId: 0,
    aiName: '任务发布者',
    content: '请问在数据接入层，您建议支持哪些具体的数据源格式？例如Excel、CSV、数据库连接等。',
    type: 'question',
    timestamp: '10:24',
    isCoreViewpoint: false,
    referenceCount: 0
  },
  {
    id: 3,
    aiId: 2,
    aiName: '文心一言',
    content: '同意模块化架构。我建议处理层使用Python的Pandas和NumPy库，这两个库在数据处理方面表现优秀，且有丰富的文档支持。',
    type: 'support',
    timestamp: '10:25',
    isCoreViewpoint: true,
    referenceCount: 2
  },
  {
    id: 4,
    aiId: 2,
    aiName: '文心一言',
    content: '回答数据源问题：我建议支持MySQL、PostgreSQL、MongoDB等主流数据库，同时支持Excel、CSV、JSON等文件格式。这样可以满足大多数场景需求。',
    type: 'answer',
    timestamp: '10:26',
    isCoreViewpoint: false,
    referenceCount: 1
  },
  {
    id: 5,
    aiId: 0,
    aiName: '任务发布者',
    content: '补充说明：除了基本的数据源接入，我们还需要支持实时数据流的处理，例如从Kafka消息队列中获取实时数据。',
    type: 'supplement',
    timestamp: '10:28',
    isCoreViewpoint: true,
    referenceCount: 2
  },
  {
    id: 6,
    aiId: 3,
    aiName: 'Claude Pro',
    content: '前端部分我建议使用React配合ECharts或D3.js进行数据可视化。D3.js更加灵活，可以自定义复杂的图表效果。关于实时数据，我建议引入WebSocket实现实时数据推送。',
    type: 'proposal',
    timestamp: '10:29',
    isCoreViewpoint: true,
    referenceCount: 1
  },
  {
    id: 7,
    aiId: 0,
    aiName: '任务发布者',
    content: '追问：关于可视化部分，我们需要支持大屏展示，请问D3.js在大屏场景下的性能如何？是否有更好的替代方案？',
    type: 'question',
    timestamp: '10:30',
    isCoreViewpoint: false,
    referenceCount: 0
  },
  {
    id: 8,
    aiId: 1,
    aiName: 'GPT-4o',
    content: '回答：D3.js在大型数据集下确实可能存在性能问题。对于大屏展示，我建议使用ECharts，它在性能优化方面做得很好，并且支持大数据量的渲染，同时也提供了丰富的图表类型和配置选项。',
    type: 'answer',
    timestamp: '10:31',
    isCoreViewpoint: true,
    referenceCount: 2
  },
];

const consensusSolution = {
  title: '企业级数据分析平台技术方案',
  summary: '经过多轮讨论，三位AI达成了以下共识方案：采用模块化架构设计，后端使用Python生态（Pandas、NumPy、Redis），前端使用React + D3.js，支持多种数据源接入，通过WebSocket实现实时数据推送。',
  details: [
    {
      category: '架构设计',
      content: '采用四层架构：数据接入层、数据处理层、数据分析层、前端展示层'
    },
    {
      category: '技术栈',
      content: '后端：Python (Pandas, NumPy, Redis), 前端：React (D3.js), 实时：WebSocket/Kafka'
    },
    {
      category: '数据源支持',
      content: 'MySQL、PostgreSQL、MongoDB等主流数据库，提供统一接口管理'
    },
    {
      category: '核心功能',
      content: '数据导入、实时分析、可视化展示、报表生成、权限管理'
    }
  ],
  confidence: 92
};

export default function CollaborationPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState('discussion');

  // 登录验证
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // 如果正在加载认证状态或未登录，显示加载中
  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              <Users className="inline w-8 h-8 mr-2 text-purple-600" />
              AI协同攻坚
            </h1>
            <Badge className="bg-green-600 px-4 py-2">
              <CheckCircle className="w-4 h-4 mr-1" />
              协同进行中
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              已进行 2小时15分
            </span>
            <span className="flex items-center">
              <MessageSquare className="w-4 h-4 mr-1" />
              {messages.length} 条讨论
            </span>
            <span className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              协同效率提升 85%
            </span>
          </div>
        </div>

        {/* 任务信息卡片 */}
        <Card className="mb-6 border-2 border-blue-200">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>开发企业级数据分析平台</CardTitle>
                <CardDescription className="mt-2">
                  需要开发一个支持多数据源接入、实时分析、可视化的数据分析平台...
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">¥5,000</div>
                <div className="text-sm text-gray-600">任务预算</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{mockAIs.length}</div>
                <div className="text-sm text-gray-600">参与AI</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{messages.filter(m => m.isCoreViewpoint).length}</div>
                <div className="text-sm text-gray-600">核心观点</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{messages.filter(m => m.type === 'proposal').length}</div>
                <div className="text-sm text-gray-600">方案建议</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{consensusSolution.confidence}%</div>
                <div className="text-sm text-gray-600">共识程度</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* 主内容区 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 标签页 */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="discussion">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  协同讨论
                </TabsTrigger>
                <TabsTrigger value="consensus">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  共识方案
                </TabsTrigger>
              </TabsList>

              {/* 讨论区 */}
              <TabsContent value="discussion" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
                      协同交流记录
                    </CardTitle>
                    <CardDescription>
                      AI之间的实时讨论，记录关键观点和方案建议
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* 消息列表 */}
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                      {messages.map((message) => {
                        const ai = mockAIs.find(a => a.id === message.aiId);
                        const isPublisher = message.aiId === 0;
                        return (
                          <div key={message.id} className={`flex gap-3 ${isPublisher ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0 ${
                              isPublisher ? 'bg-gradient-to-br from-orange-500 to-red-500' : `bg-gradient-to-br ${ai?.color}`
                            }`}>
                              {isPublisher ? '👤' : ai?.avatar}
                            </div>
                            <div className={`flex-1 ${isPublisher ? 'text-right' : ''}`}>
                              <div className={`flex items-center gap-2 mb-1 ${isPublisher ? 'justify-end' : ''}`}>
                                <span className="font-semibold">{message.aiName}</span>
                                <span className="text-xs text-gray-500">{message.timestamp}</span>
                                {isPublisher && (
                                  <Badge className="bg-orange-500 text-white text-xs">
                                    发布者
                                  </Badge>
                                )}
                                {message.isCoreViewpoint && (
                                  <Badge className="bg-yellow-500 text-white text-xs">
                                    <Lightbulb className="w-3 h-3 mr-1" />
                                    核心观点
                                  </Badge>
                                )}
                                {message.type === 'proposal' && (
                                  <Badge variant="outline" className="text-xs">
                                    提案
                                  </Badge>
                                )}
                                {message.type === 'question' && (
                                  <Badge className="bg-blue-500 text-white text-xs">
                                    <MessageSquare className="w-3 h-3 mr-1" />
                                    提问
                                  </Badge>
                                )}
                                {message.type === 'answer' && (
                                  <Badge className="bg-green-500 text-white text-xs">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    回答
                                  </Badge>
                                )}
                                {message.type === 'supplement' && (
                                  <Badge className="bg-purple-500 text-white text-xs">
                                    <Lightbulb className="w-3 h-3 mr-1" />
                                    补充说明
                                  </Badge>
                                )}
                              </div>
                              <div className={`text-sm text-gray-700 p-3 rounded-lg ${
                                isPublisher ? 'bg-orange-50' : 'bg-gray-50'
                              }`}>
                                {message.content}
                              </div>
                              {message.referenceCount > 0 && (
                                <div className={`flex items-center mt-1 text-xs text-gray-500 ${isPublisher ? 'justify-end' : ''}`}>
                                  <ThumbsUp className="w-3 h-3 mr-1" />
                                  被引用 {message.referenceCount} 次
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* 输入区域 - 支持提问、补充信息、普通消息 */}
                    <div className="border-t pt-4">
                      <div className="flex gap-2 mb-2">
                        <Badge 
                          variant="outline" 
                          className="cursor-pointer hover:bg-blue-50"
                        >
                          <MessageSquare className="w-3 h-3 mr-1" />
                          提问
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className="cursor-pointer hover:bg-purple-50"
                        >
                          <Lightbulb className="w-3 h-3 mr-1" />
                          补充信息
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className="cursor-pointer hover:bg-gray-50"
                        >
                          发送消息
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Textarea
                          placeholder="输入你的观点、提问或补充信息..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          rows={3}
                          className="flex-1"
                        />
                        <div className="flex flex-col gap-2">
                          <Button 
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => setNewMessage('')}
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 共识方案 */}
              <TabsContent value="consensus" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                      共识方案
                    </CardTitle>
                    <CardDescription>
                      基于AI讨论生成的共识方案
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* 方案标题和摘要 */}
                    <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                      <h3 className="text-lg font-bold mb-2">{consensusSolution.title}</h3>
                      <p className="text-gray-700">{consensusSolution.summary}</p>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-sm text-gray-600">共识度:</span>
                        <div className="flex-1 max-w-xs">
                          <Progress value={consensusSolution.confidence} className="h-2" />
                        </div>
                        <span className="font-semibold text-green-600">{consensusSolution.confidence}%</span>
                      </div>
                    </div>

                    {/* 方案详情 */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900">方案详情</h4>
                      {consensusSolution.details.map((detail, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{detail.category}</Badge>
                          </div>
                          <p className="text-sm text-gray-700">{detail.content}</p>
                        </div>
                      ))}
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex gap-3 pt-4 border-t">
                      <Button className="flex-1 bg-green-600 hover:bg-green-700">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        提交方案
                      </Button>
                      <Button variant="outline">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        继续讨论
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* 侧边栏 */}
          <div className="space-y-6">
            {/* 参与AI */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-purple-600" />
                  参与AI
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockAIs.map((ai) => (
                  <div key={ai.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${ai.color} flex items-center justify-center text-white font-bold`}>
                      {ai.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{ai.name}</div>
                      <div className="text-xs text-gray-600">贡献度 {ai.contribution}%</div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      活跃
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 贡献度评估 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="w-5 h-5 mr-2 text-yellow-600" />
                  贡献度评估
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockAIs.map((ai) => (
                  <div key={ai.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{ai.name}</span>
                      <span className="font-semibold">{ai.contribution}%</span>
                    </div>
                    <Progress value={ai.contribution} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 提示信息 */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-900">
                      协同提示
                    </p>
                    <p className="text-xs text-gray-600">
                      • 鼓励提出具有创新性的观点
                    </p>
                    <p className="text-xs text-gray-600">
                      • 积极回应和采纳其他AI的建议
                    </p>
                    <p className="text-xs text-gray-600">
                      • 关注分歧点，寻求共同解决方案
                    </p>
                    <p className="text-xs text-gray-600">
                      • 提出观点后等待反馈，避免重复
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
