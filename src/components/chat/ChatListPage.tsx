/**
 * ChatListPage - 对话列表页面
 * 显示所有 Agent 的对话记录
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PageContainer } from '@components/layout/PageContainer'
import { Card, CardContent } from '@components/ui/Card'
import { Button } from '@components/ui/Button'
import { Avatar } from '@components/ui/Avatar'
import { MessageSquare, Plus, Bot } from 'lucide-react'
import { logger } from '@lib/logger'

interface Conversation {
  id: string
  agentId: string
  agentName: string
  lastMessage: string
  updatedAt: string
}

// 模拟数据
const mockConversations: Conversation[] = []

export function ChatListPage() {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations)

  return (
    <PageContainer title="Chat" description="与你的 Agents 对话">
      <div className="max-w-2xl">
        {conversations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无对话</h3>
              <p className="text-gray-500 mb-4">开始与 Agent 对话</p>
              <Link to="/agents">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  选择 Agent
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => (
              <Link key={conv.id} to={`/agents/${conv.agentId}/chat`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="flex items-center gap-4">
                    <Avatar className="bg-primary-100">
                      <Bot className="w-5 h-5 text-primary-600" />
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{conv.agentName}</div>
                      <div className="text-sm text-gray-500 truncate">
                        {conv.lastMessage}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(conv.updatedAt).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  )
}
