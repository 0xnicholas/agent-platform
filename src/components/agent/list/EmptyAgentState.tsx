/**
 * EmptyAgentState 空状态组件
 */

import { Link } from 'react-router-dom'
import { Bot } from 'lucide-react'
import { Button } from '../../ui/Button'

export function EmptyAgentState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Bot className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        还没有 Agent
      </h3>
      <p className="text-gray-500 text-center mb-6 max-w-md">
        创建一个 Agent 来开始吧！你可以创建一个客服助手、数据分析师或任何你需要的 AI 助手。
      </p>
      <Link to="/agents/new">
        <Button>创建第一个 Agent</Button>
      </Link>
    </div>
  )
}
