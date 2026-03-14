/**
 * AgentListPage Agent 列表页面
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { PageContainer } from '../../layout/PageContainer'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'
import { AgentCard } from './AgentCard'
import { AgentListSkeleton } from './AgentCardSkeleton'
import { EmptyAgentState } from './EmptyAgentState'
import type { Agent } from '@types/agent'

interface AgentListPageProps {
  agents?: Agent[]
  isLoading?: boolean
  onDelete?: (id: string) => void
  onDuplicate?: (id: string) => void
}

export function AgentListPage({ 
  agents: propAgents, 
  isLoading: propLoading, 
  onDelete, 
  onDuplicate 
}: AgentListPageProps) {
  // 如果没有传入 agents，则内部获取
  const [agents, setAgents] = useState<Agent[]>(propAgents || [])
  const [isLoading, setIsLoading] = useState(propLoading ?? true)
  
  // TODO: 内部获取 agents 列表
  // useEffect(() => {
  //   if (propAgents === undefined) {
  //     getAgents().then(setAgents).finally(() => setIsLoading(false))
  //   }
  // }, [])
  
  const [searchQuery, setSearchQuery] = useState('')

  // 过滤搜索
  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <PageContainer
      title="Agents"
      description="管理你的 AI Agents"
      actions={
        <Link to="/agents/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            创建 Agent
          </Button>
        </Link>
      }
    >
      {/* 搜索栏 */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="搜索 Agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* 内容 */}
      {isLoading ? (
        <AgentListSkeleton />
      ) : agents.length === 0 ? (
        <EmptyAgentState />
      ) : filteredAgents.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          没有找到匹配的 Agent
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAgents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
            />
          ))}
        </div>
      )}
    </PageContainer>
  )
}
