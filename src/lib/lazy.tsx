/**
 * Lazy 懒加载工具
 * 用于代码分割和延迟加载
 */

import { lazy, Suspense, ReactNode } from 'react'
import { Loading } from '@components/ui/Loading'

/**
 * 懒加载组件包装
 */
export function lazyWithRetry<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  fallback?: ReactNode
) {
  return lazy(() =>
    factory().catch((error) => {
      console.error('Failed to load component:', error)
      // 重试一次
      return new Promise((resolve) => {
        setTimeout(() => {
          factory().then(resolve).catch(resolve)
        }, 1000)
      })
    })
  )
}

/**
 * Suspense 包装器
 */
interface LazyWrapperProps {
  children: ReactNode
  fallback?: ReactNode
}

export function LazyWrapper({ children, fallback }: LazyWrapperProps) {
  return (
    <Suspense fallback={fallback || <Loading />}>
      {children}
    </Suspense>
  )
}

/**
 * 预加载资源
 */
export function preloadImage(src: string): void {
  if (typeof window !== 'undefined' && !document.querySelector(`link[href="${src}"]`)) {
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.as = 'image'
    link.href = src
    document.head.appendChild(link)
  }
}

/**
 * 预加载脚本
 */
export function preloadScript(src: string): void {
  if (typeof window !== 'undefined' && !document.querySelector(`script[src="${src}"]`)) {
    const script = document.createElement('script')
    script.src = src
    script.async = true
    document.head.appendChild(script)
  }
}

/**
 * 预加载模块
 */
export function preloadModule(href: string): void {
  if (typeof window !== 'undefined') {
    const link = document.createElement('link')
    link.rel = 'modulepreload'
    link.href = href
    document.head.appendChild(link)
  }
}

/**
 * 预连接
 */
export function preconnect(href: string): void {
  if (typeof window !== 'undefined') {
    const link = document.createElement('link')
    link.rel = 'preconnect'
    link.href = href
    document.head.appendChild(link)
  }
}
