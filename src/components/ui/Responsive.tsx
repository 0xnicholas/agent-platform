/**
 * Responsive 响应式工具组件
 * 提供移动端优化的容器和工具类
 */

import { ReactNode } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

interface ResponsiveContainerProps {
  children: ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'full'
}

/**
 * 响应式容器
 * - sm: max-w-sm (移动端全宽)
 * - md: max-w-md
 * - lg: max-w-4xl
 * - full: 全宽
 */
export function ResponsiveContainer({
  children,
  className,
  size = 'lg'
}: ResponsiveContainerProps) {
  const sizeClasses = {
    sm: 'max-w-sm mx-auto',
    md: 'max-w-2xl mx-auto',
    lg: 'max-w-4xl mx-auto',
    full: 'max-w-full'
  }

  return (
    <div className={twMerge(clsx('w-full px-4 sm:px-6 lg:px-8', sizeClasses[size], className))}>
      {children}
    </div>
  )
}

/**
 * 移动端底部导航栏
 * 类似于移动端 App 的底部导航
 */
interface BottomNavProps {
  items: Array<{
    icon: React.ElementType
    label: string
    href: string
    active?: boolean
  }>
}

export function BottomNav({ items }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50 safe-area-pb">
      <div className="flex justify-around items-center h-14">
        {items.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={twMerge(
              clsx(
                'flex flex-col items-center justify-center flex-1 h-full min-w-[64px]',
                'transition-colors duration-200',
                item.active
                  ? 'text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              )
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs mt-1">{item.label}</span>
          </a>
        ))}
      </div>
    </nav>
  )
}

/**
 * 移动端返回栏
 * 带点击返回和标题
 */
interface MobileHeaderProps {
  title: string
  onBack?: () => void
  actions?: ReactNode
}

export function MobileHeader({ title, onBack, actions }: MobileHeaderProps) {
  return (
    <div className="md:hidden flex items-center justify-between h-12 px-4 bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center gap-2">
        {onBack && (
          <button
            onClick={onBack}
            className="p-1 -ml-1 hover:bg-gray-100 rounded"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <span className="font-medium text-gray-900">{title}</span>
      </div>
      {actions && <div>{actions}</div>}
    </div>
  )
}

/**
 * 触摸友好按钮
 * 更大的点击区域
 */
interface TouchTargetProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function TouchTarget({ children, className, onClick }: TouchTargetProps) {
  return (
    <div
      className={twMerge(
        clsx(
          'min-h-[44px] min-w-[44px] flex items-center justify-center',
          'active:opacity-70 active:scale-[0.98]',
          'transition-all duration-150',
          className
        )
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

/**
 * 响应式隐藏
 * 在特定断点隐藏元素
 */
export function HideOn({ children, mobile, tablet, desktop }: {
  children: ReactNode
  mobile?: boolean
  tablet?: boolean
  desktop?: boolean
}) {
  const classes = []
  if (mobile) classes.push('md:hidden')
  if (tablet) classes.push('lg:hidden')
  if (desktop) classes.push('hidden lg:block')

  return <div className={twMerge(classes.join(' '))}>{children}</div>
}

/**
 * 响应式显示
 * 在特定断点显示元素
 */
export function ShowOn({ children, mobile, tablet, desktop }: {
  children: ReactNode
  mobile?: boolean
  tablet?: boolean
  desktop?: boolean
}) {
  const classes = []
  if (mobile) classes.push('hidden md:block')
  if (tablet) classes.push('hidden lg:block')
  if (desktop) classes.push('lg:hidden')

  return <div className={twMerge(classes.join(' '))}>{children}</div>
}

/**
 * 安全区域底部padding
 * 适配 iOS 等设备的底部安全区域
 */
export function SafeAreaBottom({ className }: { className?: string }) {
  return <div className={twMerge('h-[env(safe-area-inset-bottom)]', className)} />
}

/**
 * 安全区域顶部padding
 * 适配 iOS 等设备的顶部安全区域
 */
export function SafeAreaTop({ className }: { className?: string }) {
  return <div className={twMerge('h-[env(safe-area-inset-top)]', className)} />
}
