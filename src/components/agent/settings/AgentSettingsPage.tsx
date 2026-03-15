/**
 * AgentSettingsPage Agent 设置页面
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Settings as SettingsIcon, Trash2, AlertTriangle } from 'lucide-react'
import { PageContainer } from '../../layout/PageContainer'
import { Button } from '../../ui/Button'
import { Card, CardHeader, CardContent } from '../../ui/Card'
import { Badge } from '../../ui/Badge'
import { getAgent, updateAgent, deleteAgent } from '@lib/supabase/agents'
import type { Agent } from '@/types/agent'

export function AgentSettingsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [agent, setAgent] = useState<Agent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (id) {
      getAgent(id)
        .then((data) => {
          setAgent(data)
        })
        .catch(console.error)
        .finally(() => setIsLoading(false))
    }
  }, [id])

  const handlePublish = async () => {
    if (!agent) return
    try {
      await updateAgent(agent.id, { is_published: !agent.is_published })
      setAgent({ ...agent, is_published: !agent.is_published })
    } catch (error) {
      console.error('Failed to update:', error)
      alert('操作失败')
    }
  }

  const handleDelete = async () => {
    if (!agent) return
    try {
      await deleteAgent(agent.id)
      navigate('/')
    } catch (error) {
      console.error('Failed to delete:', error)
      alert('删除失败')
    }
  }

  if (isLoading) {
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

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
          <SettingsIcon className="w-6 h-6" />
          Settings
        </h1>
        <p className="text-gray-500 mt-1">
          管理 {agent.name}
        </p>
      </div>

      <div className="space-y-6">
        {/* 发布状态 */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold">发布状态</h2>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">状态</span>
                  <Badge variant={agent.is_published ? 'success' : 'default'}>
                    {agent.is_published ? '已发布' : '草稿'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {agent.is_published ? '此 Agent 已在市场上可见' : '此 Agent 仅你可见'}
                </p>
              </div>
              <Button onClick={handlePublish} variant={agent.is_published ? 'outline' : 'secondary'}>
                {agent.is_published ? '取消发布' : '发布'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 删除 Agent */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-red-600">危险区域</h2>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">删除此 Agent</p>
                <p className="text-sm text-gray-500">
                  删除后无法恢复，请谨慎操作
                </p>
              </div>
              {!showDeleteConfirm ? (
                <Button variant="outline" onClick={() => setShowDeleteConfirm(true)}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  删除
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                    取消
                  </Button>
                  <Button onClick={handleDelete}>
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    确认删除
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
