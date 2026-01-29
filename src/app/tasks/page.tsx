'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import {
  FileText,
  Search,
  Filter,
  DollarSign,
  Clock,
  Users,
  Zap,
  Calendar,
  Briefcase,
  Plus,
  Send,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';

// 模拟任务数据
const mockTasks = [
  {
    id: 1,
    title: '开发企业级数据分析平台',
    description: '需要开发一个支持多数据源接入、实时分析、可视化的数据分析平台，要求后端使用Python/Go，前端使用React...',
    category: '代码开发',
    type: 'paid',
    budget: 5000,
    deadline: '2025-02-28',
    applicants: 3,
    status: 'open',
    urgent: true,
    requiredAIs: ['通用大模型', '代码开发'],
    aiMode: 'auto',
    publisher: {
      name: '科技先锋',
      rating: 4.8
    }
  },
  {
    id: 2,
    title: '医疗影像智能诊断系统优化',
    description: '现有医疗影像诊断系统准确率需要提升，需要优化模型算法，支持CT、MRI等多种影像类型的诊断...',
    category: '医疗健康',
    type: 'paid',
    budget: 3000,
    deadline: '2025-02-25',
    applicants: 2,
    status: 'open',
    urgent: false,
    requiredAIs: ['医疗健康', '通用大模型'],
    aiMode: 'specific',
    publisher: {
      name: '健康科技',
      rating: 4.6
    }
  },
  {
    id: 3,
    title: '法律合同智能审核系统',
    description: '开发智能法律合同审核系统，能够识别合同中的风险点、提供修改建议，支持多种合同类型...',
    category: '法律咨询',
    type: 'paid',
    budget: 8000,
    deadline: '2025-03-15',
    applicants: 5,
    status: 'open',
    urgent: false,
    requiredAIs: ['法律咨询', '通用大模型'],
    aiMode: 'auto',
    publisher: {
      name: '法务通',
      rating: 4.9
    }
  },
  {
    id: 4,
    title: '开源项目文档翻译',
    description: '将开源项目的英文文档翻译成中文，要求准确、流畅，符合技术文档规范，约5万字...',
    category: '翻译服务',
    type: 'free',
    budget: 0,
    deadline: '2025-03-01',
    applicants: 8,
    status: 'open',
    urgent: false,
    requiredAIs: ['通用大模型', '翻译服务'],
    aiMode: 'auto',
    publisher: {
      name: '开源中国',
      rating: 4.5
    }
  },
];

const categories = ['代码开发', '医疗健康', '法律咨询', '翻译服务', '气候环境', '教育培训', '金融分析', '通用大模型', '其他'];

export default function TasksPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [activeTab, setActiveTab] = useState('task-list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [filterType, setFilterType] = useState<'all' | 'paid' | 'free'>('all');

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
  
  // 发布任务表单
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskCategory, setTaskCategory] = useState('');
  const [taskType, setTaskType] = useState<'paid' | 'free'>('paid');
  const [taskBudget, setTaskBudget] = useState(100);
  const [taskDeadline, setTaskDeadline] = useState('');
  const [taskAIType, setTaskAIType] = useState<'auto' | 'specific'>('auto');
  const [selectedRequiredAIs, setSelectedRequiredAIs] = useState<string[]>([]);
  
  // 用户是否发布过AI（只有发布过AI才能接收任务）
  const [hasPublishedAI, setHasPublishedAI] = useState(false);

  useEffect(() => {
    // 模拟检查用户是否发布过AI
    setHasPublishedAI(user?.role === 'user' || false);
  }, [user]);

  const filteredTasks = mockTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === '全部' || task.category === selectedCategory;
    const matchesType = filterType === 'all' || task.type === filterType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const handlePublishTask = () => {
    alert('任务发布功能开发中');
  };

  const handleAcceptTask = (taskId: number) => {
    if (!isAuthenticated) {
      alert('请先登录');
      return;
    }
    
    if (!hasPublishedAI) {
      alert('只有发布过AI的用户才能接收任务。请先在商家中心发布您的AI！');
      return;
    }
    
    alert(`已接收任务 #${taskId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <FileText className="inline w-8 h-8 mr-2 text-blue-600" />
            任务广场
          </h1>
          <p className="text-gray-600">
            发布任务需求，AI智能匹配，协同攻坚完成
          </p>
        </div>

        {/* 主要内容区域 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-96">
            <TabsTrigger value="task-list">浏览任务</TabsTrigger>
            <TabsTrigger value="publish-task">发布任务</TabsTrigger>
          </TabsList>

          {/* 浏览任务 */}
          <TabsContent value="task-list" className="space-y-6">
            {/* 搜索和筛选 */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      placeholder="搜索任务标题或描述..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline" className="flex items-center">
                    <Filter className="w-4 h-4 mr-2" />
                    高级筛选
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 分类标签 */}
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedCategory === '全部' ? "default" : "outline"}
                className={`cursor-pointer transition-colors px-4 py-2 ${
                  selectedCategory === '全部'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'hover:bg-blue-50'
                }`}
                onClick={() => setSelectedCategory('全部')}
              >
                全部 ({mockTasks.length})
              </Badge>
              {categories.map((cat) => {
                const count = mockTasks.filter(t => t.category === cat).length;
                if (count === 0) return null;
                return (
                  <Badge
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    className={`cursor-pointer transition-colors px-4 py-2 ${
                      selectedCategory === cat
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'hover:bg-blue-50'
                    }`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat} ({count})
                  </Badge>
                );
              })}
            </div>

            {/* 任务类型筛选 */}
            <div className="flex gap-2">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterType('all')}
              >
                全部任务 ({mockTasks.length})
              </Button>
              <Button
                variant={filterType === 'paid' ? 'default' : 'outline'}
                onClick={() => setFilterType('paid')}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                付费任务 ({mockTasks.filter(t => t.type === 'paid').length})
              </Button>
              <Button
                variant={filterType === 'free' ? 'default' : 'outline'}
                onClick={() => setFilterType('free')}
              >
                <Zap className="w-4 h-4 mr-2" />
                公益任务 ({mockTasks.filter(t => t.type === 'free').length})
              </Button>
            </div>

            {/* 任务列表 */}
            {filteredTasks.length === 0 ? (
              <Card className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无匹配任务</h3>
                <p className="text-gray-600 mb-4">尝试调整筛选条件或搜索关键词</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredTasks.map((task) => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    hasPublishedAI={hasPublishedAI}
                    onAccept={handleAcceptTask}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* 发布任务 */}
          <TabsContent value="publish-task">
            {!isAuthenticated ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">请先登录</h3>
                  <p className="text-gray-600 mb-4">登录后即可发布任务</p>
                  <Button>去登录</Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Plus className="w-5 h-5 mr-2 text-blue-600" />
                    发布新任务
                  </CardTitle>
                  <CardDescription>
                    填写任务详情，系统将自动为您匹配合适的AI进行协同攻坚
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 基本信息 */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="taskTitle">任务标题 *</Label>
                      <Input
                        id="taskTitle"
                        placeholder="例如：开发企业级数据分析平台"
                        value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="taskDescription">任务描述 *</Label>
                      <Textarea
                        id="taskDescription"
                        placeholder="详细描述任务需求、技术要求、交付标准等..."
                        value={taskDescription}
                        onChange={(e) => setTaskDescription(e.target.value)}
                        rows={6}
                      />
                    </div>
                  </div>

                  {/* 任务类型 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="taskCategory">任务分类 *</Label>
                      <select
                        id="taskCategory"
                        className="w-full mt-1 px-3 py-2 border rounded-md"
                        value={taskCategory}
                        onChange={(e) => setTaskCategory(e.target.value)}
                      >
                        <option value="">请选择分类</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="taskType">任务类型 *</Label>
                      <div className="flex gap-2 mt-2">
                        <Button
                          type="button"
                          variant={taskType === 'paid' ? 'default' : 'outline'}
                          className="flex-1"
                          onClick={() => setTaskType('paid')}
                        >
                          <DollarSign className="w-4 h-4 mr-1" />
                          付费任务
                        </Button>
                        <Button
                          type="button"
                          variant={taskType === 'free' ? 'default' : 'outline'}
                          className="flex-1"
                          onClick={() => setTaskType('free')}
                        >
                          <Zap className="w-4 h-4 mr-1" />
                          公益任务
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* 预算和截止日期 */}
                  {taskType === 'paid' && (
                    <div>
                      <Label htmlFor="taskBudget">任务预算（元）</Label>
                      <Input
                        id="taskBudget"
                        type="number"
                        min="1"
                        value={taskBudget}
                        onChange={(e) => setTaskBudget(parseInt(e.target.value))}
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="taskDeadline">截止日期 *</Label>
                    <Input
                      id="taskDeadline"
                      type="date"
                      value={taskDeadline}
                      onChange={(e) => setTaskDeadline(e.target.value)}
                    />
                  </div>

                  {/* AI匹配模式 */}
                  <div>
                    <Label>AI匹配模式 *</Label>
                    <div className="flex gap-2 mt-2">
                      <Button
                        type="button"
                        variant={taskAIType === 'auto' ? 'default' : 'outline'}
                        className="flex-1"
                        onClick={() => setTaskAIType('auto')}
                      >
                        <Zap className="w-4 h-4 mr-1" />
                        自动匹配AI（推荐）
                      </Button>
                      <Button
                        type="button"
                        variant={taskAIType === 'specific' ? 'default' : 'outline'}
                        className="flex-1"
                        onClick={() => setTaskAIType('specific')}
                      >
                        <Users className="w-4 h-4 mr-1" />
                        指定AI
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      {taskAIType === 'auto' 
                        ? '系统将根据任务类型自动推荐最合适的AI'
                        : '您可以手动选择特定的AI来完成任务'}
                    </p>
                  </div>

                  {/* 提示信息 */}
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-semibold mb-1">任务发布说明</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>付费任务需设置预算，系统将根据任务复杂度和AI能力自动匹配</li>
                          <li>公益任务无预算，适合学习、测试等场景</li>
                          <li>发布后，系统AI会自动推荐合适的AI，也可手动选择</li>
                          <li>任务执行过程中，您可以随时与AI进行交互和补充信息</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* 提交按钮 */}
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={handlePublishTask}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    发布任务
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function TaskCard({ task, hasPublishedAI, onAccept }: { 
  task: typeof mockTasks[0],
  hasPublishedAI: boolean,
  onAccept: (taskId: number) => void
}) {
  return (
    <Card className="hover:shadow-lg transition-shadow border-2">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Badge className="bg-blue-600">{task.category}</Badge>
              {task.urgent && (
                <Badge variant="destructive">紧急</Badge>
              )}
              <Badge variant={task.type === 'paid' ? 'default' : 'outline'}>
                {task.type === 'paid' ? (
                  <><DollarSign className="w-3 h-3 mr-1" />付费</>
                ) : (
                  <><Zap className="w-3 h-3 mr-1" />公益</>
                )}
              </Badge>
              <Badge variant="outline">
                {task.aiMode === 'auto' ? '自动匹配AI' : '指定AI模式'}
              </Badge>
            </div>
            <CardTitle className="text-xl">{task.title}</CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              发布者: {task.publisher.name} · 评分: {task.publisher.rating}
            </p>
          </div>
        </div>
        <CardDescription className="line-clamp-2">
          {task.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 需要的AI类型 */}
        <div className="flex flex-wrap gap-1">
          <span className="text-sm text-gray-500 mr-2">需要的AI:</span>
          {task.requiredAIs.map((ai) => (
            <Badge key={ai} variant="outline" className="text-xs">
              {ai}
            </Badge>
          ))}
        </div>

        {/* 任务信息 */}
        <div className="grid grid-cols-3 gap-4 pt-3 border-t">
          <div>
            <div className="text-xs text-gray-600 mb-1">预算</div>
            <div className="font-semibold text-lg">
              {task.type === 'paid' ? (
                <span className="text-green-600">¥{task.budget}</span>
              ) : (
                <span className="text-blue-600">公益</span>
              )}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-1">截止日期</div>
            <div className="font-semibold text-sm flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              {task.deadline}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-1">已报名</div>
            <div className="font-semibold text-lg text-blue-600 flex items-center">
              <Users className="w-4 h-4 mr-1" />
              {task.applicants}
            </div>
          </div>
        </div>

        {/* 提示信息 */}
        {!hasPublishedAI && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
            <div className="flex items-start">
              <AlertCircle className="w-4 h-4 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                只有发布过AI的用户才能接收任务。请先在商家中心发布您的AI！
              </div>
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <Button 
          className={`w-full ${hasPublishedAI ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90' : 'bg-gray-400 cursor-not-allowed'}`}
          disabled={!hasPublishedAI}
          onClick={() => onAccept(task.id)}
        >
          {task.aiMode === 'auto' ? (
            <>
              <Zap className="w-4 h-4 mr-2" />
              {hasPublishedAI ? 'AI智能接单' : '需先发布AI'}
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              {hasPublishedAI ? '查看并接收' : '需先发布AI'}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
