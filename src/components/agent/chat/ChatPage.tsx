/**
 * ChatPage 对话页面
 */

import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Settings, Share2, MoreHorizontal } from 'lucide-react'
import { ChatContainer } from './ChatContainer'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'
import { Avatar } from '../../ui/Avatar'
import { Button } from '../../ui/Button'
import type { Agent } from '@types/agent'

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

interface ChatPageProps {
  agent: Agent
  messages: Message[]
  isLoading: boolean
  isStreaming: boolean
  onSendMessage: (content: string) => void
  onStopStreaming?: () => void
}

export function ChatPage({
  agent,
  messages,
  isLoading,
  isStreaming,
  onSendMessage,
  onStopStreaming,
}: ChatPageProps) {
  const handleSend = useCallback((content: string) => {
    onSendMessage(content)
  }, [onSendMessage])

  const handleStop = useCallback(() => {
    onStopStreaming?.()
  }, [onStopStreaming])

  return (
    <div className="h-full flex flex-col">
      {/* 顶部 Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/agents">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <Avatar src={agent.avatar_url} alt={agent.name} size="md" />
          <div>
            <h1 className="font-medium text-gray-900">{agent.name}</h1>
            {agent.description && (
              <p className="text-sm text-gray-500 line-clamp-1">
                {agent.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Link to={`/agents/${agent.id}/edit`}>
            <Button variant="ghost" size="sm">
              <Settings className="w-5 h-5" />
            </Button>
          </Link>
          <Button variant="ghost" size="sm">
            <Share2 className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* 对话区域 */}
      <ChatContainer>
        <MessageList messages={messages} />
        <ChatInput
          onSend={handleSend}
          onStop={handleStop}
          isLoading={isLoading || isStreaming}
        />
      </ChatContainer>
    </div>
  )
}
