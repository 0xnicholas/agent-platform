/**
 * AgentCard Agent 卡片组件
 */

import { Link } from 'react-router-dom'
import { MoreHorizontal, MessageSquare, Play, Settings, Copy, Trash2 } from 'lucide-react'
import { Card } from '../../ui/Card'
import { Avatar } from '../../ui/Avatar'
import { Badge } from '../../ui/Badge'
import type { Agent } from '@/types/agent'

interface AgentCardProps {
  agent: Agent
  onDelete?: (id: string) => void
  onDuplicate?: (id: string) => void
}

export function AgentCard({ agent, onDelete, onDuplicate }: AgentCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow group">
      <div className="p-4">
        {/* 头部 */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar 
              src={agent.avatar_url} 
              alt={agent.name}
              size="lg"
            />
            <div>
              <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                <Link to={`/agents/${agent.id}`}>
                  {agent.name}
                </Link>
              </h3>
              <p className="text-sm text-gray-500 line-clamp-1">
                {agent.description || '暂无描述'}
              </p>
            </div>
          </div>
          
          {/* 菜单 */}
          <div className="relative group/menu">
            <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreHorizontal className="w-5 h-5 text-gray-400" />
            </button>
            <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-10">
              <Link
                to={`/agents/${agent.id}/chat`}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg"
              >
                <Play className="w-4 h-4" />
                对话
              </Link>
              <Link
                to={`/agents/${agent.id}/edit`}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Settings className="w-4 h-4" />
                设置
              </Link>
              <button
                onClick={() => onDuplicate?.(agent.id)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Copy className="w-4 h-4" />
                复制
              </button>
              <button
                onClick={() => onDelete?.(agent.id)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
              >
                <Trash2 className="w-4 h-4" />
                删除
              </button>
            </div>
          </div>
        </div>

        {/* 统计 */}
        <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <MessageSquare className="w-4 h-4" />
            {agent.total_conversations} 对话
          </div>
          <Badge variant={agent.is_published ? 'success' : 'default'}>
            {agent.is_published ? '已发布' : '草稿'}
          </Badge>
        </div>
      </div>
    </Card>
  )
}
