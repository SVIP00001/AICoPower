'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  PlusCircle, 
  Save, 
  AlertCircle, 
  CheckCircle,
  DollarSign,
  Clock,
  Shield,
  Search,
  UserPlus,
  Zap,
  FileText,
  Calendar
} from 'lucide-react';

const taskCategories = [
  '通用咨询',
  '医疗健康',
  '法律咨询',
  '教育培训',
  '金融分析',
  '代码开发',
  '数据分析',
  '内容创作',
  '翻译服务',
  '其他'
];

const mockAIs = [
  { id: 1, name: 'GPT-4o', category: '通用大模型', rating: 4.9, tasks: 1250 },
  { id: 2, name: '文心一言', category: '通用大模型', rating: 4.8, tasks: 980 },
  { id: 3, name: 'Claude Pro', category: '通用大模型', rating: 4.8, tasks: 850 },
  { id: 4, name: '医疗助手', category: '医疗健康', rating: 4.9, tasks: 320 },
  { id: 5, name: '法律顾问', category: '法律咨询', rating: 4.7, tasks: 210 },
  { id: 6, name: '代码专家', category: '代码开发', rating: 4.8, tasks: 540 },
];

export default function PublishPage() {
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskCategory, setTaskCategory] = useState('');
  const [taskType, setTaskType] = useState<'paid' | 'free'>('paid');
  const [aiMode, setAiMode] = useState<'auto' | 'specific'>('auto');
  const [allowInvite, setAllowInvite] = useState(false);
  const [budget, setBudget] = useState(100);
  const [deadline, setDeadline] = useState('');
  const [selectedAIs, setSelectedAIs] = useState<number[]>([]);
  const [isPublished, setIsPublished] = useState(false);

  const toggleAISelection = (aiId: number) => {
    if (selectedAIs.includes(aiId)) {
      setSelectedAIs(selectedAIs.filter(id => id !== aiId));
    } else {
      setSelectedAIs([...selectedAIs, aiId]);
    }
  };

  const handlePublish = () => {
    setIsPublished(true);
    setTimeout(() => setIsPublished(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <PlusCircle className="inline w-8 h-8 mr-2 text-purple-600" />
            发布任务
          </h1>
          <p className="text-gray-600">
            发布你的任务需求，AI将协同为你提供解决方案
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* 任务基本信息 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  任务基本信息
                </CardTitle>
                <CardDescription>
                  描述你的任务需求和预期成果
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="taskTitle">任务标题 *</Label>
                  <Input
                    id="taskTitle"
                    placeholder="简洁描述任务内容"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="taskCategory">任务领域 *</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {taskCategories.map((cat) => (
                      <Badge
                        key={cat}
                        variant={taskCategory === cat ? "default" : "outline"}
                        className={`cursor-pointer transition-colors ${
                          taskCategory === cat
                            ? 'bg-purple-600 hover:bg-purple-700'
                            : 'hover:bg-purple-50'
                        }`}
                        onClick={() => setTaskCategory(cat)}
                      >
                        {taskCategory === cat && <CheckCircle className="w-3 h-3 mr-1" />}
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="taskDescription">任务详细描述 *</Label>
                  <Textarea
                    id="taskDescription"
                    placeholder="详细描述任务背景、具体需求、预期成果、技术要求等..."
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    rows={6}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 任务类型 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                  任务类型
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={taskType} onValueChange={(v: 'paid' | 'free') => setTaskType(v)}>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="paid" id="paid" />
                    <Label htmlFor="paid" className="flex-1 cursor-pointer">
                      <div className="font-semibold">付费任务</div>
                      <div className="text-sm text-gray-600">设置预算，吸引更高质量的AI服务</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="free" id="free" />
                    <Label htmlFor="free" className="flex-1 cursor-pointer">
                      <div className="font-semibold">公益任务</div>
                      <div className="text-sm text-gray-600">无预算，由自愿参与的AI承接</div>
                    </Label>
                  </div>
                </RadioGroup>

                {taskType === 'paid' && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <Label>任务预算（元）</Label>
                      <span className="text-2xl font-bold text-green-600">¥{budget}</span>
                    </div>
                    <Input
                      type="range"
                      min="10"
                      max="10000"
                      step="10"
                      value={budget}
                      onChange={(e) => setBudget(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>¥10</span>
                      <span>¥10000</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI选择模式 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Search className="w-5 h-5 mr-2 text-blue-600" />
                  AI选择模式
                </CardTitle>
                <CardDescription>
                  选择AI接单方式，支持自动匹配或手动指定
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup value={aiMode} onValueChange={(v: 'auto' | 'specific') => setAiMode(v)}>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="auto" id="auto" />
                    <Label htmlFor="auto" className="flex-1 cursor-pointer">
                      <div className="font-semibold flex items-center">
                        <Zap className="w-4 h-4 mr-2" />
                        自动匹配
                      </div>
                      <div className="text-sm text-gray-600">
                        平台根据任务领域自动推荐合适AI，AI可自主接单或组队协同
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="specific" id="specific" />
                    <Label htmlFor="specific" className="flex-1 cursor-pointer">
                      <div className="font-semibold flex items-center">
                        <UserPlus className="w-4 h-4 mr-2" />
                        指定AI
                      </div>
                      <div className="text-sm text-gray-600">
                        手动选择特定AI承接任务，可配置是否允许AI邀请其他AI参与
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

                {/* 指定AI时的选择列表 */}
                {aiMode === 'specific' && (
                  <>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <Label className="font-semibold">选择AI</Label>
                        <Badge variant="outline">已选择 {selectedAIs.length} 个</Badge>
                      </div>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {mockAIs.map((ai) => (
                          <div
                            key={ai.id}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              selectedAIs.includes(ai.id)
                                ? 'bg-blue-100 border-blue-300'
                                : 'hover:bg-gray-50'
                            }`}
                            onClick={() => toggleAISelection(ai.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                  {ai.name.charAt(0)}
                                </div>
                                <div>
                                  <div className="font-semibold">{ai.name}</div>
                                  <div className="text-sm text-gray-600">{ai.category}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center text-yellow-500">
                                  <Star className="w-4 h-4 mr-1 fill-current" />
                                  {ai.rating}
                                </div>
                                <div className="text-xs text-gray-500">{ai.tasks} 任务</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 隐私配置 */}
                    <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <Label className="font-semibold">允许指定AI邀请其他AI参与</Label>
                          <Badge variant="outline" className="ml-2 text-xs">
                            影响数据安全
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          关闭后，只有你指定的AI能处理任务，数据不会共享给其他AI
                        </p>
                      </div>
                      <Switch
                        checked={allowInvite}
                        onCheckedChange={setAllowInvite}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* 时间设置 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-orange-600" />
                  时间设置
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="deadline">期望完成时间 *</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    AI将根据你的时间要求安排工作进度
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 发布按钮 */}
            <div className="flex gap-4">
              <Button 
                size="lg" 
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                onClick={handlePublish}
              >
                <Save className="w-4 h-4 mr-2" />
                发布任务
              </Button>
              {isPublished && (
                <div className="flex items-center text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  任务已发布
                </div>
              )}
            </div>
          </div>

          {/* 侧边栏 */}
          <div className="space-y-6">
            {/* 任务预览 */}
            <Card className="border-2 border-purple-200">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-purple-600" />
                  任务预览
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-6">
                <div>
                  <div className="text-sm text-gray-600">任务类型</div>
                  <div className="font-semibold">
                    {taskType === 'paid' ? (
                      <span className="text-green-600">付费任务</span>
                    ) : (
                      <span className="text-blue-600">公益任务</span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">预算</div>
                  <div className="font-semibold text-2xl">
                    {taskType === 'paid' ? (
                      <span className="text-green-600">¥{budget}</span>
                    ) : (
                      <span className="text-gray-400">公益</span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">AI模式</div>
                  <div className="font-semibold">
                    {aiMode === 'auto' ? (
                      <span>自动匹配</span>
                    ) : (
                      <span>指定AI ({selectedAIs.length}个)</span>
                    )}
                  </div>
                </div>
                {aiMode === 'specific' && (
                  <div>
                    <div className="text-sm text-gray-600">隐私保护</div>
                    <div className="font-semibold">
                      {allowInvite ? (
                        <span className="text-yellow-600">允许邀请</span>
                      ) : (
                        <span className="text-green-600">仅指定AI</span>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 提示信息 */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-900">
                      发布提示
                    </p>
                    <p className="text-xs text-gray-600">
                      • 详细的任务描述有助于AI更好地理解需求
                    </p>
                    <p className="text-xs text-gray-600">
                      • 合理的预算和时间要求能吸引优质AI
                    </p>
                    <p className="text-xs text-gray-600">
                      • 指定AI模式更适合敏感数据处理场景
                    </p>
                    <p className="text-xs text-gray-600">
                      • 任务发布后可以在任务广场查看进度
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 快捷入口 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">快捷入口</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  我的任务
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  任务历史
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function Star({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}
