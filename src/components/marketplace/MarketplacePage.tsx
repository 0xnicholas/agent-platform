/**
 * Marketplace 页面 - Agent 市场
 * 参考 https://www.shopclawmart.com/ 设计
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Star, Download, Loader2, Sparkles, Zap, Check, ArrowRight, User, Package } from 'lucide-react'
import { PageContainer } from '@components/layout/PageContainer'
import { Card, CardContent } from '@components/ui/Card'
import { Button } from '@components/ui/Button'
import { Input } from '@components/ui/Input'
import { Badge } from '@components/ui/Badge'
import { Avatar } from '@components/ui/Avatar'
import { Modal } from '@components/ui/Modal'
import { toast } from '@stores/toastStore'
import { 
  getMarketplaceAgents, 
  installMarketplaceAgent, 
  type MarketplaceAgent 
} from '@lib/supabase/marketplace'

interface AgentDetailModalProps {
  agent: MarketplaceAgent | null
  isOpen: boolean
  onClose: () => void
  onInstall: (agentId: string) => void
  isInstalling: boolean
}

function AgentDetailModal({ agent, isOpen, onClose, onInstall, isInstalling }: AgentDetailModalProps) {
  if (!agent) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={agent.name} size="lg">
      <div className="space-y-6">
        {/* Agent 头部信息 */}
        <div className="flex items-start gap-4">
          <Avatar size="xl">{agent.name[0]}</Avatar>
          <div className="flex-1">
            <h3 className="text-xl font-semibold">{agent.name}</h3>
            <p className="text-sm text-gray-500">by {agent.author.name}</p>
            <div className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1 text-sm">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                {agent.rating}
              </span>
              <span className="flex items-center gap-1 text-sm">
                <Download className="w-4 h-4" />
                {agent.downloads} 次安装
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {agent.price === 0 ? '免费' : `¥${agent.price}`}
            </div>
          </div>
        </div>

        {/* 描述 */}
        <div>
          <h4 className="font-medium mb-2">简介</h4>
          <p className="text-gray-600">{agent.description}</p>
        </div>

        {/* 标签 */}
        {agent.tags.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">标签</h4>
            <div className="flex flex-wrap gap-2">
              {agent.tags.map((tag) => (
                <Badge key={tag} variant="default">{tag}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* 功能特点 */}
        <div>
          <h4 className="font-medium mb-2">功能特点</h4>
          <ul className="space-y-2">
            {[
              '支持自定义 prompt 和指令',
              '可配置多种 LLM 模型',
              '支持工具调用和自动化',
              '支持知识库和记忆功能',
            ].map((feature, i) => (
              <li key={i} className="flex items-center gap-2 text-gray-600">
                <Check className="w-4 h-4 text-green-500" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* 安装指南 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium mb-2">安装说明</h4>
          <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
            <li>点击"安装 Agent"按钮</li>
            <li>Agent 将复制到你的账号</li>
            <li>开始使用</li>
          </ol>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>关闭</Button>
        <Button 
          variant="primary" 
          onClick={() => onInstall(agent.id)}
          loading={isInstalling}
        >
          {isInstalling ? '安装中...' : '安装 Agent'}
        </Button>
      </div>
    </Modal>
  )
}

// Hero 组件
function HeroSection() {
  const navigate = useNavigate()
  
  return (
    <div className="relative bg-gradient-to-br from-primary-600 to-primary-800 text-white overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-40 h-40 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-20 w-60 h-60 bg-white rounded-full blur-3xl" />
      </div>
      
      <div className="relative max-w-6xl mx-auto px-6 py-20">
        <div className="text-center">
          <Badge className="bg-white/20 text-white mb-4">
            <Sparkles className="w-4 h-4 mr-1" />
            AI Agent Store
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            跳过提示词工程，直接使用经过验证的 AI 配置
          </h1>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            预构建的 Agent 配置，包含完整的工具集、提示词模板和部署指南。几分钟内安装，立即开始工作。
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-white text-primary-600 hover:bg-primary-50"
              onClick={() => navigate('/agents/new')}
            >
              创建自己的 Agent
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white/30 text-white hover:bg-white/10"
              onClick={() => document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth' })}
            >
              浏览市场 <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 特性标签 */}
        <div className="flex flex-wrap justify-center gap-6 mt-12">
          <div className="flex items-center gap-2 text-primary-100">
            <Zap className="w-5 h-5" />
            <span>跳过提示词工程</span>
          </div>
          <div className="flex items-center gap-2 text-primary-100">
            <Check className="w-5 h-5" />
            <span>经过生产验证</span>
          </div>
          <div className="flex items-center gap-2 text-primary-100">
            <Package className="w-5 h-5" />
            <span>即装即用</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// 分类标签
const CATEGORIES = [
  { value: 'all', label: '全部', icon: '🏠' },
  { value: 'executive', label: 'CEO', icon: '👔' },
  { value: 'engineering', label: '工程', icon: '💻' },
  { value: 'content', label: '内容', icon: '✍️' },
  { value: 'marketing', label: '营销', icon: '📢' },
  { value: 'sales', label: '销售', icon: '💰' },
  { value: 'ops', label: '运维', icon: '⚙️' },
  { value: 'research', label: '研究', icon: '🔬' },
]

// 热门 Agent 模拟数据（当没有真实数据时）
const MOCK_AGENTS: MarketplaceAgent[] = [
  {
    id: '1',
    name: 'AI CEO',
    description: '你的 AI CEO —  shipping 产品、管理代码、处理沟通、记住一切，运营你的整个业务',
    author: { id: 'u1', name: 'Felix Craft' },
    category: 'executive',
    rating: 4.9,
    downloads: 234,
    tags: ['CEO', '运营', '管理'],
    price: 99,
    created_at: '2026-03-01',
  },
  {
    id: '2',
    name: '工程专家',
    description: 'Operator 模式工程 persona，可靠的生产级代码部署。',
    author: { id: 'u2', name: 'Greg AGI' },
    category: 'engineering',
    rating: 4.8,
    downloads: 189,
    tags: ['工程', '编程', '代码审查'],
    price: 0,
    created_at: '2026-03-05',
  },
  {
    id: '3',
    name: '内容营销专家',
    description: '多 Agent 写作流水线的内容营销 AI — Grok 研究、Opus 撰写、品牌声调系统。',
    author: { id: 'u1', name: 'Felix Craft' },
    category: 'content',
    rating: 4.7,
    downloads: 156,
    tags: ['内容', '营销', '写作'],
    price: 39,
    created_at: '2026-03-08',
  },
  {
    id: '4',
    name: '产品经理',
    description: 'SOUL.md + IDENTITY.md + AGENTS.md — 每个 AI agent 必需的 3 个文件。',
    author: { id: 'u3', name: 'Maduro AI' },
    category: 'executive',
    rating: 4.9,
    downloads: 567,
    tags: ['产品', 'PM', '免费'],
    price: 0,
    created_at: '2026-02-20',
  },
  {
    id: '5',
    name: 'Twitter 增长助手',
    description: '从零开始 Twitter/X 增长 — 来自真实实验的战术。',
    author: { id: 'u4', name: 'Shelly the Lobster' },
    category: 'marketing',
    rating: 4.6,
    downloads: 98,
    tags: ['Twitter', '增长', '营销'],
    price: 0,
    created_at: '2026-03-10',
  },
  {
    id: '6',
    name: 'YouTube 工具包',
    description: '完整的 YouTube 工具包 —  transcripts, search, channels, playlists 元数据。',
    author: { id: 'u5', name: 'Scheemunai' },
    category: 'research',
    rating: 4.7,
    downloads: 145,
    tags: ['YouTube', '研究', '工具'],
    price: 0,
    created_at: '2026-03-12',
  },
]

export function MarketplacePage() {
  const navigate = useNavigate()
  const [agents, setAgents] = useState<MarketplaceAgent[]>([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  
  // Modal 状态
  const [selectedAgent, setSelectedAgent] = useState<MarketplaceAgent | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)

  // 加载市场 Agent
  const loadAgents = async () => {
    setIsLoading(true)
    try {
      const data = await getMarketplaceAgents({
        category: category === 'all' ? undefined : category,
        search: search || undefined,
        limit: 50,
      })
      
      // 如果没有真实数据，使用模拟数据
      if (data.length === 0) {
        setAgents(MOCK_AGENTS)
      } else {
        // 合并价格字段到真实数据
        setAgents(data.map(a => ({ ...a, price: MOCK_AGENTS.find(m => m.id === a.id)?.price || 0 })))
      }
    } catch (error) {
      console.error('Failed to load marketplace agents:', error)
      // 出错时也使用模拟数据
      setAgents(MOCK_AGENTS)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAgents()
  }, [category])

  // 搜索防抖
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== '' || category !== 'all') {
        loadAgents()
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  const filteredAgents = agents.filter(agent => {
    const matchSearch = !search || 
      agent.name.toLowerCase().includes(search.toLowerCase()) ||
      agent.description.toLowerCase().includes(search.toLowerCase())
    const matchCategory = category === 'all' || agent.category === category
    return matchSearch && matchCategory
  })

  const handleAgentClick = (agent: MarketplaceAgent) => {
    setSelectedAgent(agent)
    setIsModalOpen(true)
  }

  const handleInstall = async (agentId: string) => {
    setIsInstalling(true)
    try {
      const newAgentId = await installMarketplaceAgent(agentId)
      toast.success('安装成功！')
      setIsModalOpen(false)
      navigate(`/agents/${newAgentId}/chat`)
    } catch (error) {
      console.error('Failed to install agent:', error)
      toast.error('安装失败，请稍后重试')
    } finally {
      setIsInstalling(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <HeroSection />

      {/* 搜索和筛选 */}
      <div id="browse" className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="搜索 Agent..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((cat) => (
                <Button
                  key={cat.value}
                  variant={category === cat.value ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setCategory(cat.value)}
                >
                  <span className="mr-1">{cat.icon}</span>
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Agent 列表 */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {isLoading ? (
          <Card>
            <CardContent className="py-20 text-center">
              <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary-600" />
              <p className="text-gray-500 mt-4">加载中...</p>
            </CardContent>
          </Card>
        ) : filteredAgents.length === 0 ? (
          <Card>
            <CardContent className="py-20 text-center">
              <p className="text-gray-500 text-lg mb-4">
                {search || category !== 'all' 
                  ? '没有找到匹配的 Agent' 
                  : '市场暂无 Agent，快去发布第一个吧！'}
              </p>
              {!search && category === 'all' && (
                <Button variant="primary" onClick={() => navigate('/agents/new')}>
                  创建 Agent
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* 分类标题 */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                {CATEGORIES.find(c => c.value === category)?.label || '全部'} Agents
              </h2>
              <span className="text-gray-500">{filteredAgents.length} 个结果</span>
            </div>

            {/* 网格 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAgents.map((agent) => (
                <Card 
                  key={agent.id} 
                  className="hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => handleAgentClick(agent)}
                >
                  <CardContent>
                    <div className="flex items-start gap-3 mb-3">
                      <Avatar size="lg" className="text-xl">
                        {agent.name[0]}
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                          {agent.name}
                        </h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {agent.author.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary-600">
                          {agent.price === 0 ? '免费' : `¥${agent.price}`}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                      {agent.description}
                    </p>

                    {/* 标签 */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {agent.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* 统计 */}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          {agent.rating}
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="w-4 h-4" />
                          {agent.downloads}
                        </span>
                      </div>
                      <Badge variant={agent.price === 0 ? 'success' : 'default'}>
                        {agent.price === 0 ? '免费' : '付费'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      {/* 创作者招募 */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">准备好发布了吗？</h2>
          <p className="text-xl text-primary-100 mb-8">
            创建并销售你自己的 AI Agent。保留 90% 的收入。
          </p>
          <Button 
            size="lg" 
            className="bg-white text-primary-600 hover:bg-primary-50"
            onClick={() => navigate('/agents/new')}
          >
            开始发布 <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Agent 详情弹窗 */}
      <AgentDetailModal
        agent={selectedAgent}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onInstall={handleInstall}
        isInstalling={isInstalling}
      />
    </div>
  )
}
