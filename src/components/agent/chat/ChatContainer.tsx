/**
 * ChatContainer 对话容器组件
 */

import { ReactNode } from 'react'

interface ChatContainerProps {
  children: ReactNode
}

export function ChatContainer({ children }: ChatContainerProps) {
  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-gray-200 overflow-hidden">
      {children}
    </div>
  )
}
