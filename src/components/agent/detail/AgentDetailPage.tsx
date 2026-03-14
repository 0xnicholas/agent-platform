/**
 * AgentDetailPage Agent 详情页面
 * 根据路由显示不同内容：Chat / Profile
 */

import { useState, useEffect } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import { 
  Send,
  Brain,
  Plug,
  User
} from 'lucide-react'
import { PageContainer } from '../../layout/PageContainer'
import { Button } from '../../ui/Button'
import { Avatar } from '../../ui/Avatar'
import { Badge } from '../../ui/Badge'
import { Card, CardHeader, CardContent } from '../../ui/Card'
import { Input } from '../../ui/Input'
import { getAgent, updateAgent } from '@lib/supabase/agents'
import type { Agent } from '@types/agent'

export function AgentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const [agent, setAgent] = useState<Agent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // 判断当前路由
  const isProfile = location.pathname.includes('/profile')
  const isKnowledge = location.pathname.includes('/knowledge')
  const isMemory = location.pathname.includes('/memory')
  const isIntegrations = location.pathname.includes('/integrations')
  const isTasks = location.pathname.includes('/tasks')
  
  // 默认显示 Chat
  const isChat = !isProfile && !isKnowledge && !isMemory && !isIntegrations && !isTasks

  // Profile/Identity 表单
  const [agentName, setAgentName] = useState('')
  const [yourName, setYourName] = useState('')
  const [description, setDescription] = useState('')
  
  // Profile 表单（其他字段）
  const [profileForm, setProfileForm] = useState({
    identity: '',
    soul: '',
    user: '',
  })

  // Chat 消息
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([])
  const [input, setInput] = useState('')

  useEffect(() => {
    if (id) {
      getAgent(id)
        .then((data) => {
          setAgent(data)
          setAgentName(data.name)
          setDescription(data.description || '')
          setProfileForm({
            identity: data.profile?.identity || '',
            soul: data.profile?.principles || '',
            user: data.profile?.userContext || '',
          })
          setYourName(data.profile?.userContext || '')
        })
        .catch(console.error)
        .finally(() => setIsLoading(false))
    }
  }, [id])

  const handleSendMessage = () => {
    if (!input.trim()) return
    setMessages([...messages, { role: 'user', content: input }])
    setInput('')
  }

  const handleSaveProfile = async () => {
    if (!agent) return
    setIsSaving(true)
    try {
      await updateAgent(agent.id, {
        profile: {
          identity: profileForm.identity,
          principles: profileForm.soul,
          userContext: profileForm.user,
        },
      })
      alert('保存成功')
    } catch (error) {
      console.error('Failed to save profile:', error)
      alert('保存失败')
    } finally {
      setIsSaving(false)
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
          <p className="text-gray-500 mb-4">Agent 不存在</p>
          <Link to="/">
            <Button variant="outline">返回首页</Button>
          </Link>
        </div>
      </PageContainer>
    )
  }

  // Profile / Identity 页面
  if (isProfile) {
    const handleSave = async () => {
      if (!agent) return
      setIsSaving(true)
      try {
        await updateAgent(agent.id, {
          name: agentName,
          description: description,
          profile: {
            identity: profileForm.identity,
            principles: profileForm.soul,
            userContext: yourName,
          },
        })
        alert('保存成功')
      } catch (error) {
        console.error('Failed to save:', error)
        alert('保存失败')
      } finally {
        setIsSaving(false)
      }
    }

    return (
      <PageContainer>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <User className="w-6 h-6" />
            Identity
          </h1>
          <p className="text-gray-500 mt-1">
            管理 {agent.name} 的身份设定
          </p>
        </div>

        <Card>
          <CardContent className="py-6 space-y-6">
            {/* Agent Name */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                AGENT NAME
              </label>
              <Input
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="Agent name"
              />
            </div>

            {/* Your Name */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                YOUR NAME
              </label>
              <Input
                value={yourName}
                onChange={(e) => setYourName(e.target.value)}
                placeholder="What to call them:"
              />
              <p className="text-xs text-gray-500 mt-1">
                How the agent addresses you
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                DESCRIPTION
              </label>
              <textarea
                className="w-full px-3 py-2 border rounded-lg"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does this agent do?"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline">
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? '保存中' : 'Save'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </PageContainer>
    )
  }

  // Chat 页面（默认）- 沉浸式体验
  return (
    <div className="h-full flex flex-col">
      {/* Chat 内容 - 全屏无头部 */}
      <div className="flex-1 flex flex-col">
        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>开始与 {agent.name} 对话</p>
              <p className="text-sm mt-2">你：你好，请介绍一下你自己</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <Avatar size="sm">{msg.role === 'user' ? 'U' : 'A'}</Avatar>
                <div className={`px-4 py-2 rounded-lg max-w-[70%] ${msg.role === 'user' ? 'bg-primary-600 text-white' : 'bg-gray-100'}`}>
                  {msg.content}
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* 输入框 */}
        <div className="p-4 border-t bg-white">
          <div className="flex gap-2 max-w-4xl mx-auto">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="发送消息..."
              className="flex-1"
            />
            <Button onClick={handleSendMessage}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
