/**
 * Layout 主布局组件
 * 响应式设计：Sidebar 滑入滑出效果
 */

import { useState } from 'react'
import { ReactNode } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

interface LayoutProps {
  children: ReactNode
  agentId?: string
  agentName?: string
}

export function Layout({ children, agentId, agentName }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // 只在 Agent 页面显示 sidebar
  const showSidebar = Boolean(agentId)

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header onToggleSidebar={showSidebar ? toggleSidebar : undefined} sidebarOpen={sidebarOpen} />
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar */}
        {showSidebar && agentId && (
          <>
            {/* 遮罩层 - 移动端 */}
            <div 
              className={`
                fixed inset-0 bg-black/50 z-30 transition-opacity duration-300 md:hidden
                ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
              `}
              onClick={() => setSidebarOpen(false)}
            />
            {/* 侧边栏 */}
            <div className={`
              w-64 shrink-0 bg-gray-900 h-full
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
              fixed md:relative inset-y-0 left-0 z-40 transition-transform duration-300 ease-in-out
            `}>
              <Sidebar agentId={agentId} agentName={agentName} onClose={() => setSidebarOpen(false)} />
            </div>
          </>
        )}
        
        <main className={`flex-1 overflow-auto ${showSidebar ? 'md:ml-0' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  )
}
