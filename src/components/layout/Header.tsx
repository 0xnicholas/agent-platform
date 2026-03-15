/**
 * Header 顶部导航栏
 */

import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LogOut, User, Loader2, Menu, X } from 'lucide-react'
import { supabase } from '@lib/supabase/client'
import { logger } from '@lib/logger'

interface HeaderProps {
  onToggleSidebar?: () => void
  sidebarOpen?: boolean
}

export function Header({ onToggleSidebar, sidebarOpen }: HeaderProps) {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const location = useLocation()
  
  // 只在 Agent 详情页显示菜单按钮
  const isAgentPage = location.pathname.includes('/agents/')

  // 获取用户信息
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setIsLoading(false)
    })
  }, [])

  // 获取用户名：优先使用 display_name，其次使用 email 前缀
  const displayName = user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || '用户'

  const handleLogout = async () => {
    logger.info('Logging out...')
    await supabase.auth.signOut()
    window.location.href = '/auth'
  }

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 relative z-50">
      {/* 左侧：菜单按钮 + Logo */}
      <div className="flex items-center gap-2">
        {/* 固定在左上角的菜单按钮 */}
        {isAgentPage && (
          <button
            onClick={onToggleSidebar}
            className="p-2 hover:bg-gray-100 rounded-lg -ml-2"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}
        
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">AP</span>
          </div>
          <span className="font-semibold text-gray-900 hidden sm:block">Agent Platform</span>
        </Link>
      </div>

      {/* 右侧：用户信息 */}
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      ) : user ? (
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
            <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-primary-600" />
            </div>
            <div className="text-sm">
              <div className="font-medium text-gray-900">{displayName}</div>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="p-2 hover:bg-gray-100 rounded-lg"
            title="退出登录"
          >
            <LogOut className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      ) : (
        <Link 
          to="/auth" 
          className="text-sm text-primary-600 hover:text-primary-700"
        >
          登录
        </Link>
      )}
    </header>
  )
}
