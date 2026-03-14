/**
 * MessageList 消息列表组件
 */

import { useRef, useEffect } from 'react'
import { MessageBubble } from './MessageBubble'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt?: string
  toolCalls?: Array<{
    id: string
    name: string
    status: string
    result?: string
  }>
  isLoading?: boolean
}

interface MessageListProps {
  messages: Message[]
}

export function MessageList({ messages }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  // 自动滚动到底部
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <p className="text-lg mb-2">开始对话</p>
          <p className="text-sm">发送消息开始与 Agent 交流</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          role={message.role}
          content={message.content}
          isLoading={message.isLoading}
          toolCalls={message.toolCalls}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
