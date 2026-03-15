/**
 * HomePage 首页
 * 显示最近创建的 Agents 和快速入口
 * 点击创建自动生成 Agent
 */

import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '@lib/supabase/client'
import { 
  Bot, 
  Plus, 
  ArrowRight, 
  MessageSquare, 
  LayoutGrid,
  Sparkles,
  Clock,
  ChevronRight,
  Loader2
} from 'lucide-react'
import { PageContainer } from '@components/layout/PageContainer'
import { Card, CardContent } from '@components/ui/Card'
import { Avatar } from '@components/ui/Avatar'
import { Badge } from '@components/ui/Badge'
import { getAgents, createAgent } from '@lib/supabase/agents'
import { logger } from '@lib/logger'
import type { Agent } from '@/types/agent'

export function HomePage() {
  const navigate = useNavigate()
  const [recentAgents, setRecentAgents] = useState<Agent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    // 检查登录状态，未登录跳转到登录页
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        window.location.href = '/auth'
        return
      }
      
      getAgents()
        .then((agents) => {
          setRecentAgents(agents.slice(0, 4))
        })
        .catch((error) => {
          logger.error('Failed to fetch agents', error)
        })
        .finally(() => {
          setIsLoading(false)
        })
    })
  }, [])

  const handleCreateAgent = async () => {
    setIsCreating(true)
    try {
      logger.info('Creating agent...')
      
      // 自动创建 Agent
      const agent = await createAgent({
        name: `Agent_${Date.now()}`,
        description: '',
        profile: { identity: '', principles: '', tone: '', userContext: '' },
        model_config: { model: 'kimi-turbo' },
      })
      logger.info('Auto-created agent', { id: agent.id })
      
      // 跳转到 Agent 详情页
      navigate(`/agents/${agent.id}`)
    } catch (error: any) {
      logger.error('Failed to create agent', error)
      alert(error?.message || error?.error?.message || '创建失败，请刷新页面重试')
      setIsCreating(false)
    }
  }

  return (
    <PageContainer>
      {/* Hero 区域 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to Agent Platform
        </h1>
        <p className="text-gray-600">
          创建和管理你的 AI Agents
        </p>
      </div>

      {/* 快速操作 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <button
          onClick={handleCreateAgent}
          disabled={isCreating}
          className="text-left"
        >
          <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-primary-500 to-primary-700 text-white border-0">
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  {isCreating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Plus className="w-6 h-6" />}
                </div>
                <div>
                  <div className="font-semibold text-lg">
                    {isCreating ? '创建中...' : 'Create Agent'}
                  </div>
                  <div className="text-primary-100 text-sm">
                    {isCreating ? '请稍候' : '创建新 Agent'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </button>

        <Link to="/chat">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-lg">Start Chat</div>
                  <div className="text-gray-500 text-sm">与 Agent 对话</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/marketplace">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <LayoutGrid className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="font-semibold text-lg">Marketplace</div>
                  <div className="text-gray-500 text-sm">发现更多 Agents</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* 最近创建的 Agents */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            最近创建的 Agents
          </h2>
          <Link to="/agents" className="text-primary-600 hover:text-primary-700 flex items-center gap-1">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-16" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : recentAgents.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bot className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无 Agent</h3>
              <p className="text-gray-500 mb-4">点击上方 Create Agent 创建你的第一个 Agent</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentAgents.map((agent) => (
              <Link key={agent.id} to={`/agents/${agent.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="py-4">
                    <div className="flex items-center gap-3">
                      <Avatar size="lg" className="bg-primary-100">
                        <Bot className="w-5 h-5 text-primary-600" />
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{agent.name}</div>
                        <div className="text-sm text-gray-500 truncate">
                          {agent.description || '暂无描述'}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <Badge variant={agent.is_published ? 'success' : 'default'}>
                        {agent.is_published ? '已发布' : '草稿'}
                      </Badge>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 功能介绍 */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          核心功能
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="py-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <Bot className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-medium mb-1">Agent 管理</h3>
              <p className="text-sm text-gray-500">创建、配置和管理你的 AI Agents</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="py-6">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                <MessageSquare className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-medium mb-1">智能对话</h3>
              <p className="text-sm text-gray-500">与 Agents 自然对话，获取精准回答</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="py-6">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                <LayoutGrid className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-medium mb-1">Marketplace</h3>
              <p className="text-sm text-gray-500">发现和使用社区创建的 Agents</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}
