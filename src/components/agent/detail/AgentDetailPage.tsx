/**
 * AgentDetailPage Agent 详情页面
 * 路由入口，根据路径显示不同模块
 */

import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { PageContainer } from '../../layout/PageContainer'
import { getAgent } from '@lib/supabase/agents'
import type { Agent } from '@lib/supabase/agents'

export function AgentDetailPage() {
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
          <p className="text-gray-500 mb-4">Agent 不存在</p>
        </div>
      </PageContainer>
    )
  }

  // AgentDetailPage 现在只是一个容器
  // 实际的路由内容由 App.tsx 中的子路由处理
  // 这里可以放置一些共享的状态或布局

  return null
}
