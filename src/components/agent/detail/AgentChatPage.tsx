/**
 * AgentChatPage Agent 对话页面
 * 包装 ChatPage，处理数据加载
 */

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { PageContainer } from '../../layout/PageContainer'
import { ChatPage } from '../chat/ChatPage'
import { getAgent } from '../../../lib/supabase/agents'
import type { Agent } from '../../../types/agent'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  toolCalls?: Array<{
    id: string
    name: string
    status: string
    result?: string
  }>
  isLoading?: boolean
}

export function AgentChatPage() {
  const { id } = useParams<{ id: string }>()
  const [agent, setAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)

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

  const handleSendMessage = useCallback(async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
    }
    
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      isLoading: true,
    }

    setMessages(prev => [...prev, userMessage, assistantMessage])
    setIsLoading(true)
    setIsStreaming(true)

    try {
      // TODO: 调用实际的 API
      // 模拟响应
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessage.id 
          ? { ...msg, content: `收到消息: ${content}`, isLoading: false }
          : msg
      ))
    } catch (error) {
      console.error('发送消息失败:', error)
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessage.id 
          ? { ...msg, content: '发送消息失败', isLoading: false }
          : msg
      ))
    } finally {
      setIsLoading(false)
      setIsStreaming(false)
    }
  }, [])

  const handleStopStreaming = useCallback(() => {
    setIsStreaming(false)
    setIsLoading(false)
    setMessages(prev => prev.map(msg => 
      msg.isLoading ? { ...msg, isLoading: false } : msg
    ))
  }, [])

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

  return (
    <ChatPage
      agent={agent}
      messages={messages}
      isLoading={isLoading}
      isStreaming={isStreaming}
      onSendMessage={handleSendMessage}
      onStopStreaming={handleStopStreaming}
    />
  )
}
