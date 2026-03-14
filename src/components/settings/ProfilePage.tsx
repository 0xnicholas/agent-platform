/**
 * ProfilePage - Agent Profile 配置
 * 对应 Base44 Brain: Identity, Soul, User
 */

import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { PageContainer } from '@components/layout/PageContainer'
import { Card, CardHeader, CardContent } from '@components/ui/Card'
import { Button } from '@components/ui/Button'
import { Input } from '@components/ui/Input'
import { Avatar } from '@components/ui/Avatar'
import { getAgent, updateAgent } from '@lib/supabase/agents'
import { logger } from '@lib/logger'

export function ProfilePage() {
  const { id } = useParams<{ id: string }>()
  const [agent, setAgent] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    identity: '',
    soul: '',
    user: '',
  })

  useEffect(() => {
    if (id) {
      getAgent(id)
        .then((data) => {
          setAgent(data)
          setFormData({
            identity: data.profile?.identity || '',
            soul: data.profile?.principles || '',
            user: data.profile?.userContext || '',
          })
        })
        .catch(console.error)
        .finally(() => setIsLoading(false))
    }
  }, [id])

  const handleSave = async () => {
    if (!agent) return
    setIsSaving(true)
    try {
      await updateAgent(agent.id, {
        profile: {
          ...agent.profile,
          identity: formData.identity,
          principles: formData.soul,
          userContext: formData.user,
        },
      })
      logger.info('Profile saved')
    } catch (error) {
      logger.error('Failed to save profile', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <PageContainer title="Profile">
        <div className="animate-pulse">Loading...</div>
      </PageContainer>
    )
  }

  if (!id) {
    return (
      <PageContainer title="Profile">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">请先选择一个 Agent</p>
          </CardContent>
        </Card>
      </PageContainer>
    )
  }

  return (
    <PageContainer title="Profile" description="配置 Agent 的身份和角色设定">
      <div className="max-w-2xl space-y-6">
        {/* Agent 信息 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar size="xl">{agent?.name?.[0] || 'A'}</Avatar>
              <div>
                <h2 className="font-semibold text-lg">{agent?.name}</h2>
                <p className="text-sm text-gray-500">{agent?.description}</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Identity */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold">Identity 身份</h2>
            <p className="text-sm text-gray-500">
              描述 Agent 的身份、角色和核心能力
            </p>
          </CardHeader>
          <CardContent>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              rows={6}
              value={formData.identity}
              onChange={(e) => setFormData({ ...formData, identity: e.target.value })}
              placeholder={`你是一个专业的客服助手

- 熟悉产品知识和常见问题
- 能够理解用户情绪并给出恰当回应
- 提供清晰、准确的信息`}
            />
          </CardContent>
        </Card>

        {/* Soul */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold">Soul 灵魂</h2>
            <p className="text-sm text-gray-500">
              Agent 的行为原则、决策方式和价值观
            </p>
          </CardHeader>
          <CardContent>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              rows={6}
              value={formData.soul}
              onChange={(e) => setFormData({ ...formData, soul: e.target.value })}
              placeholder={`行为原则：
- 始终保持专业和耐心
- 优先解决用户问题
- 不确定的问题要如实告知用户

决策方式：
- 基于事实做出判断
- 必要时寻求用户确认`}
            />
          </CardContent>
        </Card>

        {/* User */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold">User 用户</h2>
            <p className="text-sm text-gray-500">
              服务对象背景和沟通偏好
            </p>
          </CardHeader>
          <CardContent>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              rows={4}
              value={formData.user}
              onChange={(e) => setFormData({ ...formData, user: e.target.value })}
              placeholder={`目标用户：
- 企业客户
- 技术背景较强

沟通偏好：
- 喜欢直接简洁
- 注重效率`}
            />
          </CardContent>
        </Card>

        {/* 保存 */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? '保存中...' : '保存 Profile'}
          </Button>
        </div>
      </div>
    </PageContainer>
  )
}
