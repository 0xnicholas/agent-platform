/**
 * Sidebar 左侧导航
 * Agent 页面显示完整导航，非 Agent 页面显示简化导航
 */

import { NavLink } from 'react-router-dom'
import { 
  Bot, 
  MessageSquare,
  Settings,
  ListTodo,
  ChevronDown,
  ChevronRight,
  User,
  BookOpen,
  MemoryStick,
  Plug,
  X,
  Home,
  Sparkles
} from 'lucide-react'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'

interface SidebarProps {
  agentId: string
  agentName?: string
  onClose?: () => void
}

export function Sidebar({ agentId, agentName, onClose }: SidebarProps) {
  const [profileExpanded, setProfileExpanded] = useState(true)
  const location = useLocation()
  const currentAgentId = agentId

  // 判断是否在 Agent 详情页
  const isAgentPage = location.pathname.includes('/agents/')

  // Agent 详情页的 Profile 子导航
  const profileSubItems = [
    { to: `/agents/${currentAgentId}/profile`, icon: User, label: 'Identity' },
    { to: `/agents/${currentAgentId}/skills`, icon: Sparkles, label: 'Skills' },
    { to: `/agents/${currentAgentId}/knowledge`, icon: BookOpen, label: 'Knowledge' },
    { to: `/agents/${currentAgentId}/memory`, icon: MemoryStick, label: 'Memory' },
    { to: `/agents/${currentAgentId}/integrations`, icon: Plug, label: 'Integrations' },
  ]

  // 通用导航
  const commonItems = [
    { to: '/', icon: Home, label: '首页' },
    { to: '/chat', icon: MessageSquare, label: 'Chat' },
    { to: '/tasks', icon: ListTodo, label: 'Tasks' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <aside className="w-64 bg-gray-900 flex flex-col text-white h-full">
      {/* 移动端关闭按钮 */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <span className="font-semibold">导航</span>
        <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Agent 名称 */}
      {agentName && (
        <div className="px-4 py-3 border-b border-gray-800">
          <div className="font-medium text-sm truncate">{agentName}</div>
        </div>
      )}

      {/* 导航 */}
      <nav className="px-3 py-4 flex-1 overflow-y-auto">
        <div className="space-y-1">
          {/* Agent 详情页：显示 Profile 展开组 */}
          {isAgentPage && currentAgentId && (
            <>
              {/* Chat - 直接跳转 */}
              <NavLink
                to={`/agents/${currentAgentId}`}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive && !location.pathname.includes('/profile') && !location.pathname.includes('/knowledge') && !location.pathname.includes('/memory') && !location.pathname.includes('/integrations') && !location.pathname.includes('/tasks')
                      ? 'bg-gray-800 text-white' 
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                <MessageSquare className="w-5 h-5" />
                <span className="text-sm font-medium">Chat</span>
              </NavLink>

              {/* Profile 展开组 */}
              <button
                onClick={() => setProfileExpanded(!profileExpanded)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-gray-400 hover:bg-gray-800 hover:text-white"
              >
                <User className="w-5 h-5" />
                <span className="text-sm font-medium flex-1 text-left">Profile</span>
                {profileExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              
              {profileExpanded && (
                <div className="ml-4 mt-1 space-y-1 border-l border-gray-700 pl-3">
                  {profileSubItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                          isActive 
                            ? 'bg-gray-800 text-white' 
                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                        }`
                      }
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="text-sm">{item.label}</span>
                    </NavLink>
                  ))}
                </div>
              )}

              {/* Tasks */}
              <NavLink
                to={`/agents/${currentAgentId}/tasks`}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-gray-800 text-white' 
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                <ListTodo className="w-5 h-5" />
                <span className="text-sm font-medium">Tasks</span>
              </NavLink>

              {/* Settings */}
              <NavLink
                to={`/agents/${currentAgentId}/settings`}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-gray-800 text-white' 
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                <Settings className="w-5 h-5" />
                <span className="text-sm font-medium">Settings</span>
              </NavLink>
            </>
          )}

          {/* 非 Agent 页面：显示通用导航 */}
          {!isAgentPage && commonItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* 底部：返回首页 */}
      <div className="px-3 py-3 border-t border-gray-800">
        <NavLink
          to="/"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
              isActive ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`
          }
        >
          <Bot className="w-5 h-5" />
          <span className="text-sm font-medium">返回首页</span>
        </NavLink>
      </div>
    </aside>
  )
}
