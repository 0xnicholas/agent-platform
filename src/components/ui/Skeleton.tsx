/**
 * Skeleton 骨架屏组件
 * 用于加载占位
 */

import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
}

export function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
}: SkeletonProps) {
  return (
    <div
      className={twMerge(
        clsx(
          'animate-shimmer',
          {
            'rounded-full': variant === 'circular',
            'rounded': variant === 'text' ? 'full' : 'lg',
            'h-4': variant === 'text',
          },
          className
        )
      )}
      style={{
        width: width,
        height: height,
      }}
    />
  )
}

/**
 * 卡片骨架屏
 */
export function CardSkeleton() {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <Skeleton className="w-1/3" height={16} />
          <Skeleton className="w-1/2" height={12} />
        </div>
      </div>
      <Skeleton className="w-full" height={60} />
      <div className="flex gap-2">
        <Skeleton className="w-16" height={28} />
        <Skeleton className="w-16" height={28} />
      </div>
    </div>
  )
}

/**
 * 列表骨架屏
 */
export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
          <Skeleton variant="circular" width={32} height={32} />
          <div className="flex-1 space-y-1">
            <Skeleton className="w-1/4" height={14} />
            <Skeleton className="w-1/3" height={12} />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * 聊天消息骨架屏
 */
export function ChatSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className={`flex gap-3 ${i % 2 === 1 ? 'flex-row-reverse' : ''}`}
        >
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton
            className="max-w-[70%]"
            height={i % 2 === 0 ? 40 : 60}
          />
        </div>
      ))}
    </div>
  )
}
