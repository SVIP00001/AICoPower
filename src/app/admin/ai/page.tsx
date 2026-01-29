'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Brain,
  CheckCircle,
  XCircle,
  Eye,
  Loader2,
  Search,
  Filter,
  Play,
  Pause,
  Ban,
  AlertCircle,
  FileText,
} from 'lucide-react';

// AI状态配置
const AI_STATUS_CONFIG = {
  pending: {
    label: '待审核',
    variant: 'secondary' as const,
    color: 'bg-yellow-100 text-yellow-800',
  },
  testing: {
    label: '测试中',
    variant: 'outline' as const,
    color: 'bg-blue-100 text-blue-800',
  },
  certified: {
    label: '已认证',
    variant: 'default' as const,
    color: 'bg-green-100 text-green-800',
  },
  active: {
    label: '活跃',
    variant: 'default' as const,
    color: 'bg-green-100 text-green-800',
  },
  suspended: {
    label: '暂停',
    variant: 'outline' as const,
    color: 'bg-orange-100 text-orange-800',
  },
  banned: {
    label: '封禁',
    variant: 'destructive' as const,
    color: 'bg-red-100 text-red-800',
  },
};

// AI类型配置
const AI_TYPES = {
  general: '通用大模型',
  vertical: '垂直领域AI',
  startup: '中小创新AI',
  tool: '工具类AI',
  merchant: '商家AI',
};

// AI等级配置
const AI_LEVELS = {
  beginner: '初级',
  intermediate: '中级',
  advanced: '高级',
  master: '顶尖',
};

export default function AIManagementPage() {
  const [activeTab, setActiveTab] = useState('pending');
  const [ais, setAis] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [selectedAI, setSelectedAI] = useState<any>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewComment, setReviewComment] = useState('');

  // 筛选状态
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // 获取token
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  };

  // 加载AI列表
  const loadAIs = async () => {
    setIsLoading(true);
    try {
      const token = getToken();
      if (!token) {
        console.error('未登录');
        return;
      }

      const response = await fetch(`/api/admin/ai?status=${activeTab}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (result.success) {
        setAis(result.data || []);
      } else {
        console.error('加载AI列表失败：', result.error);
      }
    } catch (error) {
      console.error('加载AI列表失败：', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAIs();
  }, [activeTab]);

  // 审核AI
  const handleReview = async (approved: boolean) => {
    setIsActionLoading(true);
    try {
      const token = getToken();
      if (!token || !selectedAI) return;

      const response = await fetch(`/api/admin/ai/${selectedAI.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          approved,
          comment: reviewComment,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setShowReviewDialog(false);
        setReviewComment('');
        loadAIs();
      } else {
        alert(result.error || '审核失败');
      }
    } catch (error) {
      console.error('审核失败：', error);
      alert('审核失败');
    } finally {
      setIsActionLoading(false);
    }
  };

  // 启用/禁用AI
  const handleToggleStatus = async (ai: any, action: 'activate' | 'deactivate' | 'ban') => {
    setIsActionLoading(true);
    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch(`/api/admin/ai/${ai.id}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });

      const result = await response.json();
      if (result.success) {
        loadAIs();
      } else {
        alert(result.error || '操作失败');
      }
    } catch (error) {
      console.error('操作失败：', error);
      alert('操作失败');
    } finally {
      setIsActionLoading(false);
    }
  };

  // 查看详情
  const handleViewDetail = (ai: any) => {
    setSelectedAI(ai);
    setShowDetailDialog(true);
  };

  // 测试AI
  const handleTest = (ai: any) => {
    setSelectedAI(ai);
    setShowTestDialog(true);
  };

  // 筛选AI列表
  const filteredAIs = ais.filter(ai => {
    const matchKeyword =
      !searchKeyword ||
      ai.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      ai.description?.toLowerCase().includes(searchKeyword.toLowerCase());

    const matchStatus = filterStatus === 'all' || ai.status === filterStatus;
    const matchType = filterType === 'all' || ai.type === filterType;

    return matchKeyword && matchStatus && matchType;
  });

  // 获取待审核数量
  const getPendingCount = () => {
    const tab = activeTab === 'pending' ? ais.length : 0;
    return tab > 0 ? `(${tab})` : '';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <Brain className="inline w-8 h-8 mr-2 text-blue-600" />
            AI管理
          </h1>
          <p className="text-gray-600">
            管理平台上的AI，包括审核、启用、禁用和测试
          </p>
        </div>

        {/* 筛选区域 */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>搜索</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="AI名称或描述"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label>状态</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="全部状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部状态</SelectItem>
                    {Object.entries(AI_STATUS_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>类型</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="全部类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部类型</SelectItem>
                    {Object.entries(AI_TYPES).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button onClick={loadAIs} disabled={isLoading}>
                  <Filter className="w-4 h-4 mr-2" />
                  应用筛选
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 主要内容区域 */}
        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <CardHeader>
              <TabsList>
                <TabsTrigger value="pending">
                  待审核 {getPendingCount()}
                </TabsTrigger>
                <TabsTrigger value="active">活跃中</TabsTrigger>
                <TabsTrigger value="suspended">已暂停</TabsTrigger>
                <TabsTrigger value="banned">已封禁</TabsTrigger>
                <TabsTrigger value="all">全部</TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">加载中...</p>
                </div>
              ) : filteredAIs.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  暂无数据
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>AI名称</TableHead>
                      <TableHead>类型</TableHead>
                      <TableHead>等级</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>发布者</TableHead>
                      <TableHead>测试分数</TableHead>
                      <TableHead>创建时间</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAIs.map((ai) => (
                      <TableRow key={ai.id}>
                        <TableCell>
                          <div className="font-medium">{ai.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {ai.description || '无描述'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{AI_TYPES[ai.type as keyof typeof AI_TYPES]}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{AI_LEVELS[ai.level as keyof typeof AI_LEVELS]}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={AI_STATUS_CONFIG[ai.status as keyof typeof AI_STATUS_CONFIG]?.color}>
                            {AI_STATUS_CONFIG[ai.status as keyof typeof AI_STATUS_CONFIG]?.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {ai.user ? (
                            <div>
                              <div className="font-medium">{ai.user.nickname || ai.user.username}</div>
                              <div className="text-sm text-gray-500">{ai.user.email}</div>
                            </div>
                          ) : (
                            <div className="text-gray-500">未知用户</div>
                          )}
                        </TableCell>
                        <TableCell>{ai.testScore || 0}/100</TableCell>
                        <TableCell>
                          {new Date(ai.createdAt).toLocaleDateString('zh-CN')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetail(ai)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>

                            {ai.status === 'pending' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedAI(ai);
                                    setShowReviewDialog(true);
                                  }}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedAI(ai);
                                    setShowReviewDialog(true);
                                  }}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </>
                            )}

                            {ai.status === 'active' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleTest(ai)}
                                >
                                  <Play className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggleStatus(ai, 'deactivate')}
                                  className="text-orange-600 hover:text-orange-700"
                                >
                                  <Pause className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggleStatus(ai, 'ban')}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Ban className="w-4 h-4" />
                                </Button>
                              </>
                            )}

                            {(ai.status === 'suspended' || ai.status === 'banned') && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleStatus(ai, 'activate')}
                                className="text-green-600 hover:text-green-700"
                              >
                                <Play className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Tabs>
        </Card>

        {/* 详情对话框 */}
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>AI详情</DialogTitle>
              <DialogDescription>查看AI的完整信息</DialogDescription>
            </DialogHeader>
            {selectedAI && (
              <div className="space-y-4">
                <div>
                  <Label>AI名称</Label>
                  <p className="text-lg font-semibold">{selectedAI.name}</p>
                </div>

                <div>
                  <Label>AI类型</Label>
                  <p>{AI_TYPES[selectedAI.type as keyof typeof AI_TYPES]}</p>
                </div>

                <div>
                  <Label>AI描述</Label>
                  <p className="text-gray-700">{selectedAI.description || '无描述'}</p>
                </div>

                <div>
                  <Label>能力标签</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedAI.tags && selectedAI.tags.length > 0 ? (
                      selectedAI.tags.map((tag: string) => (
                        <Badge key={tag} variant="outline">{tag}</Badge>
                      ))
                    ) : (
                      <span className="text-gray-500">无标签</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>测试分数</Label>
                    <p className="text-2xl font-bold">{selectedAI.testScore || 0}/100</p>
                  </div>
                  <div>
                    <Label>能力等级</Label>
                    <p>{AI_LEVELS[selectedAI.level as keyof typeof AI_LEVELS]}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>完成任务数</Label>
                    <p>{selectedAI.tasksCompleted || 0}</p>
                  </div>
                  <div>
                    <Label>总收益</Label>
                    <p className="text-green-600">
                      ¥{((selectedAI.totalRevenue || 0) / 100).toFixed(2)}
                    </p>
                  </div>
                </div>

                {selectedAI.pricingModel && (
                  <div>
                    <Label>定价信息</Label>
                    <p>
                      {selectedAI.pricingModel} - ¥{((selectedAI.pricingRate || 0) / 100).toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* 审核对话框 */}
        <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>审核AI</DialogTitle>
              <DialogDescription>
                请确认是否通过此AI的审核
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {selectedAI && (
                <>
                  <div>
                    <Label>AI名称</Label>
                    <p className="font-semibold">{selectedAI.name}</p>
                  </div>

                  <div>
                    <Label>AI描述</Label>
                    <p className="text-sm text-gray-700">{selectedAI.description}</p>
                  </div>

                  <div>
                    <Label>审核意见</Label>
                    <Textarea
                      placeholder="请输入审核意见（可选）"
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      rows={4}
                    />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowReviewDialog(false)}
                disabled={isActionLoading}
              >
                取消
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleReview(false)}
                disabled={isActionLoading}
              >
                <XCircle className="w-4 h-4 mr-2" />
                拒绝
              </Button>
              <Button
                onClick={() => handleReview(true)}
                disabled={isActionLoading}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                通过
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 测试对话框 */}
        <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>测试AI</DialogTitle>
              <DialogDescription>
                对AI进行功能测试和性能评估
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {selectedAI && (
                <>
                  <div>
                    <Label>AI名称</Label>
                    <p className="font-semibold">{selectedAI.name}</p>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-900">
                        <p className="font-semibold mb-1">测试说明</p>
                        <p>AI测试功能正在开发中，将包括：</p>
                        <ul className="list-disc list-inside mt-1">
                          <li>功能测试：验证AI基本功能</li>
                          <li>性能测试：评估响应速度和准确度</li>
                          <li>压力测试：测试并发处理能力</li>
                          <li>安全测试：检查安全漏洞</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTestDialog(false)}>
                关闭
              </Button>
              <Button disabled>
                <FileText className="w-4 h-4 mr-2" />
                开始测试（开发中）
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
