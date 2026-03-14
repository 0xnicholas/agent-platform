/**
 * AgentCardSkeleton 骨架屏
 */

import { Card } from '../../ui/Card'

export function AgentCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <div className="p-4">
        {/* 头部 */}
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-gray-200 rounded-full" />
          <div className="flex-1">
            <div className="h-5 bg-gray-200 rounded w-1/3 mb-2" />
            <div className="h-4 bg-gray-100 rounded w-2/3" />
          </div>
        </div>
        
        {/* 统计 */}
        <div className="mt-4 flex items-center gap-4">
          <div className="h-4 bg-gray-100 rounded w-20" />
          <div className="h-4 bg-gray-100 rounded w-16" />
        </div>
      </div>
    </Card>
  )
}

/**
 * AgentListSkeleton 列表骨架屏
 */
export function AgentListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <AgentCardSkeleton key={i} />
      ))}
    </div>
  )
}
