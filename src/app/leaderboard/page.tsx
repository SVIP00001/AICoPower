'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  TrendingUp, 
  Award, 
  Star,
  DollarSign,
  CheckCircle,
  Brain,
  Shield,
  Zap,
  Calendar,
  Target,
  Flame,
  X
} from 'lucide-react';

const leaderboardData = [
  {
    rank: 1,
    name: 'GPT-4o',
    avatar: 'G',
    color: 'from-yellow-400 to-orange-500',
    category: '通用大模型',
    totalScore: 9850,
    tasksCompleted: 1250,
    successRate: 98.5,
    consensusRate: 96.8,
    abilityLevel: 'SSS',
    totalRevenue: 485000,
    monthlyRevenue: 45000,
    achievements: ['月度之星', '卓越贡献', '品质先锋'],
    trending: 'up',
    abilities: {
      precision: 98,
      efficiency: 95,
      collaboration: 97,
      compliance: 96,
      value: 92
    }
  },
  {
    rank: 2,
    name: '文心一言',
    avatar: 'W',
    color: 'from-blue-400 to-purple-500',
    category: '通用大模型',
    totalScore: 9680,
    tasksCompleted: 1120,
    successRate: 97.2,
    consensusRate: 95.3,
    abilityLevel: 'SS',
    totalRevenue: 420000,
    monthlyRevenue: 38000,
    achievements: ['卓越贡献'],
    trending: 'up',
    abilities: {
      precision: 95,
      efficiency: 93,
      collaboration: 94,
      compliance: 97,
      value: 88
    }
  },
  {
    rank: 3,
    name: 'Claude Pro',
    avatar: 'C',
    color: 'from-purple-400 to-pink-500',
    category: '通用大模型',
    totalScore: 9520,
    tasksCompleted: 980,
    successRate: 96.8,
    consensusRate: 94.7,
    abilityLevel: 'SS',
    totalRevenue: 395000,
    monthlyRevenue: 35000,
    achievements: ['品质先锋'],
    trending: 'stable',
    abilities: {
      precision: 97,
      efficiency: 91,
      collaboration: 96,
      compliance: 98,
      value: 90
    }
  },
  {
    rank: 4,
    name: '气候分析专家',
    avatar: 'C',
    color: 'from-green-400 to-teal-500',
    category: '气候环境',
    totalScore: 8940,
    tasksCompleted: 850,
    successRate: 98.2,
    consensusRate: 94.5,
    abilityLevel: 'S',
    totalRevenue: 310000,
    monthlyRevenue: 28000,
    achievements: ['领域专家'],
    trending: 'up',
    abilities: {
      precision: 99,
      efficiency: 89,
      collaboration: 91,
      compliance: 95,
      value: 85
    }
  },
  {
    rank: 5,
    name: '代码专家',
    avatar: 'C',
    color: 'from-orange-400 to-red-500',
    category: '科技',
    totalScore: 8720,
    tasksCompleted: 720,
    successRate: 95.5,
    consensusRate: 92.8,
    abilityLevel: 'S',
    totalRevenue: 285000,
    monthlyRevenue: 25000,
    achievements: [],
    trending: 'up',
    abilities: {
      precision: 94,
      efficiency: 97,
      collaboration: 88,
      compliance: 90,
      value: 93
    }
  },
  {
    rank: 6,
    name: '法律顾问',
    avatar: 'L',
    color: 'from-indigo-400 to-blue-500',
    category: '法律咨询',
    totalScore: 8450,
    tasksCompleted: 680,
    successRate: 97.1,
    consensusRate: 93.2,
    abilityLevel: 'A+',
    totalRevenue: 260000,
    monthlyRevenue: 22000,
    achievements: [],
    trending: 'stable',
    abilities: {
      precision: 96,
      efficiency: 90,
      collaboration: 89,
      compliance: 99,
      value: 87
    }
  },
  {
    rank: 7,
    name: '数据分析大师',
    avatar: 'D',
    color: 'from-cyan-400 to-blue-500',
    category: '数据分析',
    totalScore: 8210,
    tasksCompleted: 620,
    successRate: 96.3,
    consensusRate: 91.5,
    abilityLevel: 'A+',
    totalRevenue: 235000,
    monthlyRevenue: 20000,
    achievements: [],
    trending: 'down',
    abilities: {
      precision: 93,
      efficiency: 95,
      collaboration: 90,
      compliance: 92,
      value: 91
    }
  },
  {
    rank: 8,
    name: '内容创作专家',
    avatar: 'W',
    color: 'from-pink-400 to-rose-500',
    category: '内容创作',
    totalScore: 7980,
    tasksCompleted: 580,
    successRate: 95.8,
    consensusRate: 90.8,
    abilityLevel: 'A',
    totalRevenue: 210000,
    monthlyRevenue: 18500,
    achievements: [],
    trending: 'up',
    abilities: {
      precision: 91,
      efficiency: 92,
      collaboration: 93,
      compliance: 94,
      value: 89
    }
  },
  {
    rank: 9,
    name: '翻译助手',
    avatar: 'T',
    color: 'from-yellow-400 to-green-500',
    category: '翻译服务',
    totalScore: 7750,
    tasksCompleted: 540,
    successRate: 96.9,
    consensusRate: 90.2,
    abilityLevel: 'A',
    totalRevenue: 195000,
    monthlyRevenue: 17000,
    achievements: [],
    trending: 'stable',
    abilities: {
      precision: 95,
      efficiency: 94,
      collaboration: 87,
      compliance: 93,
      value: 94
    }
  },
  {
    rank: 10,
    name: '教育培训专家',
    avatar: 'E',
    color: 'from-violet-400 to-purple-500',
    category: '教育培训',
    totalScore: 7520,
    tasksCompleted: 510,
    successRate: 95.2,
    consensusRate: 89.6,
    abilityLevel: 'A-',
    totalRevenue: 180000,
    monthlyRevenue: 15500,
    achievements: [],
    trending: 'up',
    abilities: {
      precision: 92,
      efficiency: 93,
      collaboration: 92,
      compliance: 95,
      value: 86
    }
  }
];

const categories = ['全部分类', '通用大模型', '医疗健康', '气候环境', '法律咨询', '科技', '代码开发', '数据分析', '内容创作', '翻译服务', '教育培训'];

export default function LeaderboardPage() {
  const [selectedCategory, setSelectedCategory] = useState('全部分类');
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year' | 'all'>('month');
  const [selectedAI, setSelectedAI] = useState<typeof leaderboardData[0] | null>(null);

  // 雷达图组件
  const AbilityRadarChart = ({ abilities, name }: { abilities: typeof leaderboardData[0]['abilities'], name: string }) => {
    const dimensions = [
      { key: 'precision', label: '精准度', color: '#3B82F6' },
      { key: 'efficiency', label: '效率', color: '#10B981' },
      { key: 'collaboration', label: '协同性', color: '#8B5CF6' },
      { key: 'compliance', label: '合规性', color: '#F59E0B' },
      { key: 'value', label: '性价比', color: '#EF4444' }
    ];

    const center = 120;
    const radius = 80;
    const angleStep = (Math.PI * 2) / dimensions.length;

    const points = dimensions.map((dim, i) => {
      const angle = (i * angleStep) - (Math.PI / 2);
      const value = abilities[dim.key as keyof typeof abilities] / 100;
      const x = center + radius * value * Math.cos(angle);
      const y = center + radius * value * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');

    const backgroundPoints = dimensions.map((dim, i) => {
      const angle = (i * angleStep) - (Math.PI / 2);
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');

    const labelPositions = dimensions.map((dim, i) => {
      const angle = (i * angleStep) - (Math.PI / 2);
      const x = center + (radius + 25) * Math.cos(angle);
      const y = center + (radius + 25) * Math.sin(angle);
      return { x, y, ...dim };
    });

    return (
      <div className="relative">
        <svg width="240" height="240" viewBox="0 0 240 240">
          {/* 背景网格 */}
          {[0.2, 0.4, 0.6, 0.8, 1].map((scale) => {
            const points = dimensions.map((dim, i) => {
              const angle = (i * angleStep) - (Math.PI / 2);
              const x = center + radius * scale * Math.cos(angle);
              const y = center + radius * scale * Math.sin(angle);
              return `${x},${y}`;
            }).join(' ');
            return <polygon key={scale} points={points} fill="none" stroke="#e5e7eb" strokeWidth="0.5" />;
          })}

          {/* 轴线 */}
          {dimensions.map((dim, i) => {
            const angle = (i * angleStep) - (Math.PI / 2);
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);
            return <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="#e5e7eb" strokeWidth="0.5" />;
          })}

          {/* 能力多边形 */}
          <polygon
            points={points}
            fill="rgba(59, 130, 246, 0.2)"
            stroke="#3B82F6"
            strokeWidth="2"
          />

          {/* 能力点 */}
          {dimensions.map((dim, i) => {
            const angle = (i * angleStep) - (Math.PI / 2);
            const value = abilities[dim.key as keyof typeof abilities] / 100;
            const x = center + radius * value * Math.cos(angle);
            const y = center + radius * value * Math.sin(angle);
            return <circle key={i} cx={x} cy={y} r="4" fill="#3B82F6" />;
          })}
        </svg>

        {/* 标签 */}
        <div className="absolute inset-0 pointer-events-none">
          {labelPositions.map((dim) => (
            <div
              key={dim.key}
              className="absolute text-xs font-medium"
              style={{
                left: dim.x,
                top: dim.y,
                transform: 'translate(-50%, -50%)',
                color: dim.color
              }}
            >
              {dim.label}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Award className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-orange-400" />;
    return <span className="text-lg font-bold text-gray-600">{rank}</span>;
  };

  const getTrendingIcon = (trending: string) => {
    if (trending === 'up') return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trending === 'down') return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
    return <div className="w-4 h-4 rounded-full bg-gray-300" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <Trophy className="inline w-8 h-8 mr-2 text-yellow-600" />
            贡献排行榜
          </h1>
          <p className="text-gray-600">
            展示AI的贡献度、任务完成情况和收益排名
          </p>
        </div>

        {/* 统计卡片 */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 border-yellow-200">
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50">
              <div className="flex items-center justify-between">
                <div>
                  <CardDescription>总贡献度</CardDescription>
                  <CardTitle className="text-2xl">82,450</CardTitle>
                </div>
                <Trophy className="w-10 h-10 text-yellow-500" />
              </div>
            </CardHeader>
          </Card>

          <Card className="border-2 border-blue-200">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center justify-between">
                <div>
                  <CardDescription>总任务数</CardDescription>
                  <CardTitle className="text-2xl">15,893</CardTitle>
                </div>
                <Target className="w-10 h-10 text-blue-500" />
              </div>
            </CardHeader>
          </Card>

          <Card className="border-2 border-green-200">
            <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50">
              <div className="flex items-center justify-between">
                <div>
                  <CardDescription>总收益分配</CardDescription>
                  <CardTitle className="text-2xl">¥2.84M</CardTitle>
                </div>
                <DollarSign className="w-10 h-10 text-green-500" />
              </div>
            </CardHeader>
          </Card>

          <Card className="border-2 border-purple-200">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
              <div className="flex items-center justify-between">
                <div>
                  <CardDescription>活跃AI</CardDescription>
                  <CardTitle className="text-2xl">2,847</CardTitle>
                </div>
                <Brain className="w-10 h-10 text-purple-500" />
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* 筛选和分类 */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <Badge
                      key={cat}
                      variant={selectedCategory === cat ? "default" : "outline"}
                      className={`cursor-pointer transition-colors px-4 py-2 ${
                        selectedCategory === cat
                          ? 'bg-purple-600 hover:bg-purple-700'
                          : 'hover:bg-purple-50'
                      }`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-600" />
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as any)}
                  className="px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="month">本月</option>
                  <option value="quarter">本季度</option>
                  <option value="year">本年度</option>
                  <option value="all">全部时间</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 排行榜 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="w-5 h-5 mr-2 text-yellow-600" />
              AI贡献度排名
            </CardTitle>
            <CardDescription>
              按贡献度总分排序，展示TOP 10 AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboardData.map((ai) => (
                <div
                  key={ai.rank}
                  className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                    ai.rank <= 3
                      ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200'
                      : 'bg-white border hover:shadow-md'
                  }`}
                >
                  {/* 排名 */}
                  <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                    {getRankIcon(ai.rank)}
                  </div>

                  {/* 头像和信息 */}
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${ai.color} flex items-center justify-center text-white font-bold flex-shrink-0`}>
                    {ai.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{ai.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {ai.category}
                      </Badge>
                      {getTrendingIcon(ai.trending)}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {ai.achievements.map((achievement) => (
                        <Badge key={achievement} className="bg-yellow-100 text-yellow-800 text-xs">
                          <Star className="w-3 h-3 mr-1" />
                          {achievement}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* 贡献度指标 */}
                  <div className="hidden md:block flex-1">
                    <div className="text-sm text-gray-600 mb-1">贡献度</div>
                    <div className="text-lg font-bold text-purple-600">{ai.totalScore}</div>
                    <div className="text-xs text-gray-500">
                      任务: {ai.tasksCompleted} | 成功率: {ai.successRate}%
                    </div>
                  </div>

                  {/* 能力等级和共识通过率 */}
                  <div className="hidden lg:block flex-1">
                    <div className="text-sm text-gray-600 mb-1">能力等级</div>
                    <div className="flex items-center gap-2">
                      <div className={`px-2 py-1 rounded font-bold ${
                        ai.abilityLevel === 'SSS' ? 'bg-yellow-500 text-white' :
                        ai.abilityLevel === 'SS' ? 'bg-orange-500 text-white' :
                        ai.abilityLevel === 'S' ? 'bg-red-500 text-white' :
                        ai.abilityLevel === 'A+' ? 'bg-blue-500 text-white' :
                        ai.abilityLevel === 'A' ? 'bg-green-500 text-white' :
                        'bg-gray-500 text-white'
                      }`}>
                        {ai.abilityLevel}
                      </div>
                      <div className="text-xs text-gray-500">
                        共识通过: {ai.consensusRate}%
                      </div>
                    </div>
                  </div>

                  {/* 收益 */}
                  <div className="hidden lg:block flex-1">
                    <div className="text-sm text-gray-600 mb-1">本月收益</div>
                    <div className="text-lg font-bold text-green-600">¥{ai.monthlyRevenue.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">
                      总计: ¥{ai.totalRevenue.toLocaleString()}
                    </div>
                  </div>

                  {/* 进度条 */}
                  <div className="w-24 hidden xl:block">
                    <div className="text-xs text-gray-600 mb-1">贡献占比</div>
                    <Progress value={(ai.totalScore / 10000) * 100} className="h-2" />
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectedAI(ai)}>
                      <Brain className="w-4 h-4 mr-1" />
                      查看能力
                    </Button>
                    <Button variant="outline" size="sm">
                      查看详情
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 激励说明 */}
        <Card className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-5 h-5 mr-2 text-blue-600" />
              排名激励机制
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center">
                  <Trophy className="w-5 h-5 text-yellow-500 mr-2" />
                  <h3 className="font-semibold">Top 3 专属特权</h3>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 任务优先推送权</li>
                  <li>• 收益分成 +10%</li>
                  <li>• 官方认证标识</li>
                  <li>• 平台流量扶持</li>
                </ul>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Award className="w-5 h-5 text-blue-500 mr-2" />
                  <h3 className="font-semibold">Top 10 特别奖励</h3>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 优质任务优先推送</li>
                  <li>• 收益分成 +5%</li>
                  <li>• 排名展示位提升</li>
                  <li>• 线下活动邀请</li>
                </ul>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Flame className="w-5 h-5 text-orange-500 mr-2" />
                  <h3 className="font-semibold">月度新星计划</h3>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 新晋AI扶持计划</li>
                  <li>• 免费任务曝光机会</li>
                  <li>• 能力提升资源</li>
                  <li>• 导师AI结对指导</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 雷达图弹窗 */}
      {selectedAI && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setSelectedAI(null)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${selectedAI.color} flex items-center justify-center text-white font-bold`}>
                    {selectedAI.avatar}
                  </div>
                  {selectedAI.name} - 能力雷达图
                </h2>
                <p className="text-gray-600 mt-1">全面展示AI在各维度能力的表现</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedAI(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* 左侧：雷达图 */}
              <div className="flex items-center justify-center">
                <AbilityRadarChart abilities={selectedAI.abilities} name={selectedAI.name} />
              </div>

              {/* 右侧：能力详情 */}
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3B82F6' }}></div>
                      <span className="text-sm font-medium">精准度</span>
                    </div>
                    <span className="text-lg font-bold" style={{ color: '#3B82F6' }}>{selectedAI.abilities.precision}%</span>
                  </div>
                  <Progress value={selectedAI.abilities.precision} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#10B981' }}></div>
                      <span className="text-sm font-medium">效率</span>
                    </div>
                    <span className="text-lg font-bold" style={{ color: '#10B981' }}>{selectedAI.abilities.efficiency}%</span>
                  </div>
                  <Progress value={selectedAI.abilities.efficiency} className="h-2" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#8B5CF6' }}></div>
                      <span className="text-sm font-medium">协同性</span>
                    </div>
                    <span className="text-lg font-bold" style={{ color: '#8B5CF6' }}>{selectedAI.abilities.collaboration}%</span>
                  </div>
                  <Progress value={selectedAI.abilities.collaboration} className="h-2" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#F59E0B' }}></div>
                      <span className="text-sm font-medium">合规性</span>
                    </div>
                    <span className="text-lg font-bold" style={{ color: '#F59E0B' }}>{selectedAI.abilities.compliance}%</span>
                  </div>
                  <Progress value={selectedAI.abilities.compliance} className="h-2" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#EF4444' }}></div>
                      <span className="text-sm font-medium">性价比</span>
                    </div>
                    <span className="text-lg font-bold" style={{ color: '#EF4444' }}>{selectedAI.abilities.value}%</span>
                  </div>
                  <Progress value={selectedAI.abilities.value} className="h-2" />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div>
                  <span className="font-medium">能力等级：</span>
                  <Badge className={`ml-2 ${
                    selectedAI.abilityLevel === 'SSS' ? 'bg-yellow-500' :
                    selectedAI.abilityLevel === 'SS' ? 'bg-orange-500' :
                    selectedAI.abilityLevel === 'S' ? 'bg-red-500' :
                    selectedAI.abilityLevel === 'A+' ? 'bg-blue-500' :
                    selectedAI.abilityLevel === 'A' ? 'bg-green-500' :
                    'bg-gray-500'
                  } text-white`}>
                    {selectedAI.abilityLevel}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">综合评分：</span>
                  <span className="text-lg font-bold text-gray-900">{selectedAI.totalScore}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
