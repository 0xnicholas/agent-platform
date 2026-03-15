/**
 * Marketplace 页面 - Agent 市场
 */

import { useState, useEffect } from 'react'
import { Search, Star, Download, ExternalLink, Copy, Check, X } from 'lucide-react'
import { PageContainer } from '@components/layout/PageContainer'
import { Card, CardContent } from '@components/ui/Card'
import { Button } from '@components/ui/Button'
import { Input } from '@components/ui/Input'
import { Badge } from '@components/ui/Badge'
import { Avatar } from '@components/ui/Avatar'
import { Modal } from '@components/ui/Modal'

interface MarketplaceAgent {
  id: string
  name: string
  description: string
  author: {
    name: string
    avatar?: string
  }
  category: string
  rating: number
  downloads: number
  tags: string[]
  isInstalled?: boolean
}

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
      <div className="space-y-4">
        {/* Agent 头部信息 */}
        <div className="flex items-start gap-4">
          <Avatar size="xl">{agent.name[0]}</Avatar>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{agent.name}</h3>
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
        </div>

        {/* 描述 */}
        <div>
          <h4 className="font-medium mb-2">简介</h4>
          <p className="text-gray-600">{agent.description}</p>
        </div>

        {/* 标签 */}
        <div>
          <h4 className="font-medium mb-2">标签</h4>
          <div className="flex flex-wrap gap-2">
            {agent.tags.map((tag) => (
              <Badge key={tag} variant="default">{tag}</Badge>
            ))}
          </div>
        </div>

        {/* 功能特点 */}
        <div>
          <h4 className="font-medium mb-2">功能特点</h4>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li>支持自定义 prompt 和指令</li>
            <li>可配置多种 LLM 模型</li>
            <li>支持工具调用和自动化</li>
            <li>支持知识库和记忆功能</li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>关闭</Button>
        <Button 
          variant="primary" 
          onClick={() => onInstall(agent.id)}
          loading={isInstalling}
          disabled={agent.isInstalled}
        >
          {agent.isInstalled ? '已安装' : '安装 Agent'}
        </Button>
      </div>
    </Modal>
  )
}

const CATEGORIES = [
  { value: 'all', label: '全部' },
  { value: 'customer_service', label: '客服' },
  { value: 'sales', label: '销售' },
  { value: 'programming', label: '编程' },
  { value: 'education', label: '教育' },
  { value: 'legal', label: '法律' },
  { value: 'finance', label: '金融' },
]

// 模拟市场数据
const MOCK_MARKETPLACE_AGENTS: MarketplaceAgent[] = [
  {
    id: '1',
    name: '客服小助手',
    description: '专业的客服助手，支持常见问题解答和情绪安抚。可以处理售前咨询、售后服务、投诉处理等多种场景。',
    author: { name: '官方' },
    category: 'customer_service',
    rating: 4.8,
    downloads: 1234,
    tags: ['客服', '售前', '售后', '情绪安抚'],
  },
  {
    id: '2',
    name: '编程导师',
    description: '帮助你学习编程，解答技术问题。支持多种编程语言，提供代码审查和优化建议。',
    author: { name: 'DevTeam' },
    category: 'programming',
    rating: 4.9,
    downloads: 2345,
    tags: ['编程', '教学', '代码审查', '技术问答'],
  },
  {
    id: '3',
    name: '销售顾问',
    description: '专业销售助手，帮你撰写销售文案、客户跟进话术和销售策略分析。',
    author: { name: 'SalesPro' },
    category: 'sales',
    rating: 4.7,
    downloads: 856,
    tags: ['销售', '文案', '客户跟进'],
  },
  {
    id: '4',
    name: '法律助手',
    description: '提供法律咨询、合同审查和合规建议。帮助您了解常见法律问题。',
    author: { name: 'LegalTech' },
    category: 'legal',
    rating: 4.6,
    downloads: 543,
    tags: ['法律', '合同审查', '合规'],
  },
  {
    id: '5',
    name: '财务分析师',
    description: '帮助你分析财务数据、投资建议和风险管理。提供专业的财务分析。',
    author: { name: 'FinanceAI' },
    category: 'finance',
    rating: 4.8,
    downloads: 432,
    tags: ['财务', '投资', '分析'],
  },
  {
    id: '6',
    name: '英语老师',
    description: '专业的英语学习助手，提供口语练习、语法解释和写作指导。',
    author: { name: 'EduTech' },
    category: 'education',
    rating: 4.9,
    downloads: 1876,
    tags: ['英语', '学习', '口语', '写作'],
  },
]

export function MarketplacePage() {
  const [agents, setAgents] = useState<MarketplaceAgent[]>(MOCK_MARKETPLACE_AGENTS)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  
  // Modal 状态
  const [selectedAgent, setSelectedAgent] = useState<MarketplaceAgent | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)

  // 模拟从 API 加载数据
  useEffect(() => {
    loadMarketplaceAgents()
  }, [])

  const loadMarketplaceAgents = async () => {
    setIsLoading(true)
    try {
      // TODO: 从 Supabase 加载公开的 agents
      // const { data } = await supabase.from('agents').select('*').eq('is_published', true)
      // setAgents(data || [])
    } catch (error) {
      console.error('Failed to load marketplace agents:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredAgents = agents.filter(agent => {
    const matchSearch = agent.name.toLowerCase().includes(search.toLowerCase()) ||
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
      // TODO: 调用 API 安装 agent
      // await installAgent(agentId)
      
      // 模拟安装
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 更新本地状态
      setAgents(prev => prev.map(a => 
        a.id === agentId ? { ...a, isInstalled: true } : a
      ))
      
      if (selectedAgent) {
        setSelectedAgent({ ...selectedAgent, isInstalled: true })
      }
    } catch (error) {
      console.error('Failed to install agent:', error)
    } finally {
      setIsInstalling(false)
    }
  }

  return (
    <PageContainer
      title="Agent 市场"
      description="发现和使用社区创建的 Agent"
    >
      {/* 搜索和筛选 */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
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
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Agent 列表 */}
      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">加载中...</p>
          </CardContent>
        </Card>
      ) : filteredAgents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">没有找到匹配的 Agent</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAgents.map((agent) => (
            <Card 
              key={agent.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleAgentClick(agent)}
            >
              <CardContent>
                <div className="flex items-start gap-3">
                  <Avatar size="lg">{agent.name[0]}</Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {agent.name}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                      {agent.description}
                    </p>
                  </div>
                </div>

                {/* 标签 */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {agent.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="default" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {agent.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{agent.tags.length - 3}
                    </Badge>
                  )}
                </div>

                {/* 统计 */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t">
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
                  {agent.isInstalled && (
                    <Badge variant="success" className="text-xs">已安装</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Agent 详情弹窗 */}
      <AgentDetailModal
        agent={selectedAgent}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onInstall={handleInstall}
        isInstalling={isInstalling}
      />
    </PageContainer>
  )
}
