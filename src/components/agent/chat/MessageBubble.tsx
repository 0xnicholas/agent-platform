/**
 * MessageBubble 消息气泡组件
 */

import { Bot, User, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Avatar } from '../../ui/Avatar'
import { Badge } from '../../ui/Badge'
import { MarkdownRenderer } from './MarkdownRenderer'

interface MessageBubbleProps {
  role: 'user' | 'assistant' | 'system'
  content: string
  isLoading?: boolean
  toolCalls?: Array<{
    id: string
    name: string
    status: string
    result?: string
  }>
}

export function MessageBubble({ role, content, isLoading, toolCalls }: MessageBubbleProps) {
  const isUser = role === 'user'
  const isSystem = role === 'system'

  if (isSystem) {
    return (
      <div className="flex justify-center py-2">
        <Badge variant="default" className="text-xs">
          {content}
        </Badge>
      </div>
    )
  }

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* 头像 */}
      <Avatar
        size="sm"
        className={isUser ? 'bg-primary-100' : 'bg-gray-100'}
      >
        {isUser ? (
          <User className="w-4 h-4 text-primary-600" />
        ) : (
          <Bot className="w-4 h-4 text-gray-600" />
        )}
      </Avatar>

      {/* 消息内容 */}
      <div className={`flex-1 max-w-[70%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-4 py-3 rounded-2xl ${
            isUser
              ? 'bg-primary-600 text-white rounded-br-md'
              : 'bg-gray-100 text-gray-900 rounded-bl-md'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">思考中...</span>
            </div>
          ) : (
            <MarkdownRenderer content={content} isUser={isUser} />
          )}
        </div>

        {/* Tool Calls */}
        {toolCalls && toolCalls.length > 0 && (
          <div className="mt-2 space-y-2">
            {toolCalls.map((tool) => (
              <div
                key={tool.id}
                className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-xs"
              >
                {tool.status === 'executing' && (
                  <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                )}
                {tool.status === 'completed' && (
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                )}
                {tool.status === 'error' && (
                  <AlertCircle className="w-3 h-3 text-red-500" />
                )}
                <span className="font-medium">{tool.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
