/**
 * AgentChatPage Agent 对话页面
 * 包装 ChatPage，处理数据加载
 */

import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { PageContainer } from '../../layout/PageContainer'
import { getAgent } from '../../../lib/supabase/agents'
import type { Agent } from '../../../types/agent'

export function AgentChatPage() {
  const { id } = useParams<{ id: string }>()
  const [agent, setAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      getAgent(id)
        .then((data) => {
          setAgent(data)
        })
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [id])

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full" />
        </div>
      </PageContainer>
    )
  }

  if (!agent) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <p className="text-gray-500">Agent 不存在</p>
        </div>
      </PageContainer>
    )
  }

  // 暂时返回简单的 chat 界面
  // 后续可以扩展为完整的 ChatPage
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="text-center text-gray-500 py-8">
          <p>与 {agent.name} 对话</p>
        </div>
      </div>
    </div>
  )
}
