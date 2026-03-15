/**
 * Marketplace 页面 - Agent 市场
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Star, Download, ExternalLink, Copy, Check, X, Loader2 } from 'lucide-react'
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
        >
          {agent.isInstalled ? '已安装' : '安装 Agent'}
        </Button>
      </div>
    </Modal>
  )
}

const CATEGORIES = [
  { value: 'all', label: '全部', icon: '🏠' },
  { value: 'customer_service', label: '客服', icon: '💬' },
  { value: 'sales', label: '销售', icon: '💰' },
  { value: 'programming', label: '编程', icon: '💻' },
  { value: 'education', label: '教育', icon: '📚' },
  { value: 'legal', label: '法律', icon: '⚖️' },
  { value: 'finance', label: '金融', icon: '📊' },
]

export function MarketplacePage() {
  const navigate = useNavigate()
  const [agents, setAgents] = useState<MarketplaceAgent[]>([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Modal 状态
  const [selectedAgent, setSelectedAgent] = useState<MarketplaceAgent | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)

  // 加载市场 Agent
  const loadAgents = async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }
    try {
      const data = await getMarketplaceAgents({
        category: category === 'all' ? undefined : category,
        search: search || undefined,
        limit: 50,
      })
      setAgents(data)
    } catch (error) {
      console.error('Failed to load marketplace agents:', error)
      toast.error('加载失败，请稍后重试')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadAgents()
  }, [category])

  // 搜索防抖
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== '' || category !== 'all') {
        loadAgents(true)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

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
      // 跳转到新安装的 Agent
      navigate(`/agents/${newAgentId}/chat`)
    } catch (error) {
      console.error('Failed to install agent:', error)
      toast.error('安装失败，请稍后重试')
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
              <span className="mr-1">{cat.icon}</span>
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Agent 列表 */}
      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-600" />
            <p className="text-gray-500 mt-2">加载中...</p>
          </CardContent>
        </Card>
      ) : agents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">
              {search || category !== 'all' 
                ? '没有找到匹配的 Agent' 
                : '市场暂无 Agent，快去发布第一个吧！'}
            </p>
            {!search && category === 'all' && (
              <Button 
                variant="primary" 
                className="mt-4"
                onClick={() => navigate('/agents')}
              >
                去发布 Agent
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
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
                {agent.tags.length > 0 && (
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
                )}

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
                  <span className="text-xs text-gray-400">
                    {new Date(agent.created_at).toLocaleDateString('zh-CN')}
                  </span>
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
