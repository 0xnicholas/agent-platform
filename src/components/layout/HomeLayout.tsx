/**
 * HomeLayout 首页布局
 * 移动端全屏显示
 */

import { ReactNode } from 'react'

interface HomeLayoutProps {
  children: ReactNode
}

export function HomeLayout({ children }: HomeLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}
