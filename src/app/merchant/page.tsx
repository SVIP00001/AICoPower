'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Brain,
  Plus,
  DollarSign,
  FileText,
  TrendingUp,
  Zap,
  Award,
  BarChart3,
  Loader2,
  Tag as TagIcon,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

// AI类型选项
const AI_TYPES = [
  { value: 'general', label: '通用大模型', description: '适用于多种场景的通用AI' },
  { value: 'vertical', label: '垂直领域AI', description: '专注于特定行业的专业AI' },
  { value: 'startup', label: '中小创新AI', description: '轻量级、快速响应的创新AI' },
  { value: 'tool', label: '工具类AI', description: '提供特定工具功能的AI' },
  { value: 'merchant', label: '商家AI', description: '面向商业场景的AI' },
];

// 定价模式选项
const PRICING_MODELS = [
  { value: 'per_call', label: '按次收费', description: '每次调用固定费用' },
  { value: 'per_compute', label: '按算力收费', description: '根据计算资源使用量计费' },
  { value: 'per_time', label: '按时长收费', description: '根据使用时长计费' },
  { value: 'custom', label: '自定义定价', description: '根据具体需求协商定价' },
];

export default function MerchantPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('ai-list');
  const [ais, setAis] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    type: 'general',
    description: '',
    tags: [] as string[],
    pricingModel: '',
    pricingRate: '',
  });

  // 推荐标签
  const [recommendedTags, setRecommendedTags] = useState<string[]>([]);
  const [isIdentifyingTags, setIsIdentifyingTags] = useState(false);
  const [inputTag, setInputTag] = useState('');

  // 获取token
  const getToken = () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      return token;
    }
    return null;
  };

  // 加载AI列表
  const loadAIProfiles = async () => {
    setIsLoading(true);
    try {
      const token = getToken();
      if (!token) {
        setMessage({ type: 'error', text: '请先登录' });
        return;
      }

      const response = await fetch('/api/ai/search?limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (result.success) {
        setAis(result.data);
      } else {
        setMessage({ type: 'error', text: result.error || '加载失败' });
      }
    } catch (error) {
      console.error('加载AI列表失败：', error);
      setMessage({ type: 'error', text: '加载AI列表失败' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAIProfiles();
  }, []);

  // 识别推荐标签
  const identifyTags = async () => {
    if (!formData.description) {
      return;
    }

    setIsIdentifyingTags(true);
    try {
      const response = await fetch('/api/ai/identify-tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: formData.description,
          type: formData.type,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setRecommendedTags(result.data.recommendedTags);
      }
    } catch (error) {
      console.error('识别标签失败：', error);
    } finally {
      setIsIdentifyingTags(false);
    }
  };

  // 当描述或类型改变时，自动识别标签
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.description) {
        identifyTags();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.description, formData.type]);

  // 添加标签
  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tag],
      });
    }
    setInputTag('');
  };

  // 移除标签
  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag),
    });
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔵 表单提交开始');
    setIsSubmitting(true);
    setMessage(null);

    try {
      const token = getToken();
      console.log('🔵 Token存在:', !!token);

      if (!token) {
        setMessage({ type: 'error', text: '请先登录' });
        setIsSubmitting(false);
        return;
      }

      // 准备提交数据
      const submitData = {
        name: formData.name,
        type: formData.type,
        description: formData.description,
        tags: formData.tags,
        ...(formData.pricingModel && { pricingModel: formData.pricingModel }),
        ...(formData.pricingRate && { pricingRate: parseInt(formData.pricingRate) * 100 }), // 转换为分
      };

      console.log('🔵 发送请求到 /api/ai/register');

      const response = await fetch('/api/ai/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      });

      console.log('🔵 响应状态:', response.status, response.statusText);

      const result = await response.json();
      console.log('🔵 响应结果:', result);

      if (result.success) {
        setMessage({ type: 'success', text: 'AI发布成功！' });
        // 重置表单
        setFormData({
          name: '',
          type: 'general',
          description: '',
          tags: [],
          pricingModel: '',
          pricingRate: '',
        });
        setRecommendedTags([]);
        // 切换到列表页
        setTimeout(() => {
          setActiveTab('ai-list');
          loadAIProfiles();
        }, 1500);
      } else {
        setMessage({ type: 'error', text: result.error || '发布失败' });
      }
    } catch (error) {
      console.error('🔴 发布AI失败：', error);
      setMessage({ type: 'error', text: '发布AI失败，请查看控制台' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 计算汇总数据
  const totalRevenue = ais.reduce((sum, ai) => sum + (ai.totalRevenue || 0), 0) / 100; // 转换为元
  const totalTasks = ais.reduce((sum, ai) => sum + (ai.tasksCompleted || 0), 0);
  const avgRating = ais.length > 0
    ? (ais.reduce((sum, ai) => sum + (ai.testScore || 0), 0) / ais.length / 20).toFixed(1)
    : '0.0';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              <Brain className="inline w-8 h-8 mr-2 text-blue-600" />
              商家中心
            </h1>
            <p className="text-gray-600">
              管理您的AI，查看使用情况和收益数据
            </p>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setActiveTab('create-ai')}
          >
            <Plus className="w-4 h-4 mr-2" />
            发布新AI
          </Button>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">已发布AI</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ais.length}</div>
              <p className="text-xs text-muted-foreground">
                活跃中: {ais.filter(ai => ai.status === 'active').length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">累计任务</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTasks}</div>
              <p className="text-xs text-muted-foreground">承接任务数</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总收益</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ¥{totalRevenue.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground text-green-600">累计收益</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">平均评分</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgRating}</div>
              <p className="text-xs text-muted-foreground">基于测试评分</p>
            </CardContent>
          </Card>
        </div>

        {/* 主要内容区域 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-96">
            <TabsTrigger value="ai-list">我的AI</TabsTrigger>
            <TabsTrigger value="create-ai">发布新AI</TabsTrigger>
          </TabsList>

          {/* AI列表 */}
          <TabsContent value="ai-list" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">加载中...</p>
              </div>
            ) : ais.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">还没有发布AI</h3>
                  <p className="text-gray-600 mb-4">发布您的第一个AI开始承接任务获取收益</p>
                  <Button onClick={() => setActiveTab('create-ai')}>
                    <Plus className="w-4 h-4 mr-2" />
                    发布AI
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {ais.map((ai) => (
                  <Card key={ai.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-xl">{ai.name}</CardTitle>
                            <Badge variant={ai.status === 'active' ? 'default' : 'secondary'}>
                              {ai.status === 'active' ? '活跃' : '停用'}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {ai.level === 'master' ? '顶尖' :
                               ai.level === 'advanced' ? '高级' :
                               ai.level === 'intermediate' ? '中级' : '初级'}
                            </Badge>
                          </div>
                          <CardDescription className="text-base">
                            {ai.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* 擅长领域 */}
                        <div>
                          <div className="text-sm text-gray-500 mb-2">擅长领域</div>
                          <div className="flex flex-wrap gap-2">
                            {ai.tags && ai.tags.length > 0 ? (
                              ai.tags.map((tag: string) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  <Zap className="w-3 h-3 mr-1" />
                                  {tag}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-sm text-gray-400">暂无标签</span>
                            )}
                          </div>
                        </div>

                        {/* 数据统计 */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                          <div>
                            <div className="flex items-center text-sm text-gray-500 mb-1">
                              <FileText className="w-3 h-3 mr-1" />
                              完成任务
                            </div>
                            <div className="text-lg font-semibold">{ai.tasksCompleted || 0}</div>
                          </div>
                          <div>
                            <div className="flex items-center text-sm text-gray-500 mb-1">
                              <DollarSign className="w-3 h-3 mr-1" />
                              总收益
                            </div>
                            <div className="text-lg font-semibold text-green-600">
                              ¥{((ai.totalRevenue || 0) / 100).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center text-sm text-gray-500 mb-1">
                              <Award className="w-3 h-3 mr-1" />
                              测试分数
                            </div>
                            <div className="text-lg font-semibold">{ai.testScore || 0}/100</div>
                          </div>
                          <div>
                            <div className="flex items-center text-sm text-gray-500 mb-1">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              贡献分
                            </div>
                            <div className="text-lg font-semibold text-blue-600">{ai.contributionScore || 0}</div>
                          </div>
                        </div>

                        {/* 操作按钮 */}
                        <div className="flex gap-2 pt-4 border-t">
                          <Button variant="outline" size="sm">
                            <BarChart3 className="w-3 h-3 mr-1" />
                            查看详情
                          </Button>
                          <Button variant="outline" size="sm">
                            编辑配置
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* 发布新AI */}
          <TabsContent value="create-ai">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="w-5 h-5 mr-2 text-blue-600" />
                  发布新AI
                </CardTitle>
                <CardDescription>
                  填写AI的基本信息，配置能力标签和定价方式，发布到平台开始承接任务
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* 消息提示 */}
                  {message && (
                    <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-900' : 'bg-red-50 text-red-900'}`}>
                      <div className="flex items-center gap-2">
                        {message.type === 'success' ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <XCircle className="w-5 h-5" />
                        )}
                        <span>{message.text}</span>
                      </div>
                    </div>
                  )}

                  {/* 基本信息 */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">基本信息</h3>

                    <div>
                      <Label htmlFor="name">AI名称 *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="请输入AI的名称"
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="type">AI类型 *</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => setFormData({ ...formData, type: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="请选择AI类型" />
                        </SelectTrigger>
                        <SelectContent>
                          {AI_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div>
                                <div className="font-medium">{type.label}</div>
                                <div className="text-xs text-muted-foreground">{type.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="description">AI描述 *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="请详细描述您的AI的功能、特点和适用场景"
                        required
                        rows={4}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* 能力标签 */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">能力标签</h3>
                      {isIdentifyingTags && (
                        <div className="flex items-center text-sm text-blue-600">
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          正在分析描述...
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="tag">添加标签</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="tag"
                          value={inputTag}
                          onChange={(e) => setInputTag(e.target.value)}
                          placeholder="输入标签后按回车添加"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addTag(inputTag);
                            }
                          }}
                        />
                        <Button type="button" onClick={() => addTag(inputTag)}>
                          <TagIcon className="w-4 h-4 mr-2" />
                          添加
                        </Button>
                      </div>
                    </div>

                    {/* 推荐标签 */}
                    {recommendedTags.length > 0 && (
                      <div>
                        <Label className="text-sm text-gray-500">推荐标签（点击添加）</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {recommendedTags
                            .filter(tag => !formData.tags.includes(tag))
                            .map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="cursor-pointer hover:bg-blue-50 hover:text-blue-700"
                                onClick={() => addTag(tag)}
                              >
                                <Zap className="w-3 h-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* 已选标签 */}
                    {formData.tags.length > 0 && (
                      <div>
                        <Label className="text-sm text-gray-500">已选标签</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {formData.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="default"
                              className="cursor-pointer"
                              onClick={() => removeTag(tag)}
                            >
                              <TagIcon className="w-3 h-3 mr-1" />
                              {tag}
                              <XCircle className="w-3 h-3 ml-1" />
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 定价信息 */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">定价信息（可选）</h3>

                    <div>
                      <Label htmlFor="pricingModel">定价模式</Label>
                      <Select
                        value={formData.pricingModel}
                        onValueChange={(value) => setFormData({ ...formData, pricingModel: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="请选择定价模式" />
                        </SelectTrigger>
                        <SelectContent>
                          {PRICING_MODELS.map((model) => (
                            <SelectItem key={model.value} value={model.value}>
                              <div>
                                <div className="font-medium">{model.label}</div>
                                <div className="text-xs text-muted-foreground">{model.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.pricingModel && (
                      <div>
                        <Label htmlFor="pricingRate">费率（元）</Label>
                        <Input
                          id="pricingRate"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.pricingRate}
                          onChange={(e) => setFormData({ ...formData, pricingRate: e.target.value })}
                          placeholder="请输入费率"
                          className="mt-1"
                        />
                      </div>
                    )}
                  </div>

                  {/* 提交按钮 */}
                  <div className="flex gap-4 pt-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting || !formData.name || !formData.description}
                      className="flex-1"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          提交中...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          发布AI
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab('ai-list')}
                      disabled={isSubmitting}
                    >
                      取消
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
