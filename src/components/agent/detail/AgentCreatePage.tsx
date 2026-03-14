/**
 * AgentCreatePage - 对话式创建 Agent
 * 参考 Base44：用自然语言描述需求，AI 自动理解并创建
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageContainer } from '@components/layout/PageContainer'
import { Card, CardContent } from '@components/ui/Card'
import { Button } from '@components/ui/Button'
import { Avatar } from '@components/ui/Avatar'
import { createAgent } from '@lib/supabase/agents'
import { logger } from '@lib/logger'
import { Bot, Send, Loader2, Sparkles } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export function AgentCreatePage() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `你好！告诉我你想创建什么样的 Agent？\n\n比如：\n• "帮我做一个客服助手"\n• "创建一个代码审查机器人"\n• "我想做一个销售线索跟进工具"`,
    },
  ])
  const [input, setInput] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const handleSend = async () => {
    if (!input.trim() || isCreating) return

    const userMessage = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])

    setIsCreating(true)

    // 模拟 AI 理解需求
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `明白了！让我帮你创建这个 Agent...`,
        },
      ])

      // 从描述中提取名称
      const name = extractAgentName(userMessage)

      // 创建 Agent
      createAgent({
        name,
        description: userMessage.slice(0, 200),
        profile: {
          identity: userMessage,
          principles: '',
          tone: '',
          userContext: '',
        },
        model_config: {
          model: 'kimi-turbo',
        },
      })
        .then((agent) => {
          logger.info('Agent created via chat', { id: agent.id, name: agent.name })
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: `✅ 已创建 "${agent.name}"！\n\n现在你可以：\n• 在 Chat 中与它对话\n• 在 Identity 中完善角色设定\n• 在 Knowledge 中添加知识库`,
            },
          ])

          // 3秒后跳转到详情页
          setTimeout(() => {
            navigate(`/agents/${agent.id}`)
          }, 3000)
        })
        .catch((error) => {
          logger.error('Failed to create agent', error)
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: '❌ 创建失败，请重试。' },
          ])
        })
        .finally(() => {
          setIsCreating(false)
        })
    }, 1500)
  }

  // 从描述中提取 Agent 名称
  const extractAgentName = (desc: string): string => {
    // 简单提取：取描述中的关键部分
    const patterns = [
      /创建一个?(.+?)(?:助手|机器人|agent|机器人)/i,
      /帮我做?(.+?)(?:助手|机器人)/i,
      /想做?(.+?)(?:助手|工具)/i,
    ]

    for (const pattern of patterns) {
      const match = desc.match(pattern)
      if (match) return match[1].trim()
    }

    // 默认：从描述中取前几个词
    const words = desc.split(/[,，、]/).filter(Boolean)
    if (words.length > 0) {
      return words[0].trim().slice(0, 20)
    }

    return `Agent_${Date.now()}`
  }

  return (
    <PageContainer title="Create Agent" description="用自然语言描述你想要">
      <div className="max-w-2xl mx-auto">
        <Card className="min-h-[500px] flex flex-col">
          <CardContent className="flex flex-col h-[500px]">
            {/* Header */}
            <div className="text-center py-4 border-b">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Sparkles className="w-6 h-6 text-primary-600" />
              </div>
              <h2 className="font-semibold">创建 Agent</h2>
              <p className="text-sm text-gray-500">用自然语言描述你的需求</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <Avatar
                    size="sm"
                    className={msg.role === 'assistant' ? 'bg-primary-100' : 'bg-gray-100'}
                  >
                    {msg.role === 'assistant' ? (
                      <Bot className="w-4 h-4 text-primary-600" />
                    ) : (
                      'U'
                    )}
                  </Avatar>
                  <div
                    className={`px-4 py-2 rounded-2xl max-w-[75%] ${
                      msg.role === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
                  </div>
                </div>
              ))}

              {isCreating && (
                <div className="flex gap-3">
                  <Avatar size="sm" className="bg-primary-100">
                    <Loader2 className="w-4 h-4 animate-spin text-primary-600" />
                  </Avatar>
                  <div className="px-4 py-2 rounded-2xl bg-gray-100">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t pt-4 mt-auto">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="描述你想创建的 Agent..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  disabled={isCreating}
                />
                <Button onClick={handleSend} disabled={!input.trim() || isCreating}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
