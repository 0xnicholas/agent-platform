/**
 * Loading 加载组件
 */

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
}

export function Loading({ size = 'md', className = '' }: LoadingProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} border-2 border-gray-200 border-t-primary-600 rounded-full animate-spin`}
      />
    </div>
  )
}

/**
 * PageLoading 页面加载
 */
export function PageLoading() {
  return (
    <div className="flex items-center justify-center h-64">
      <Loading size="lg" />
    </div>
  )
}
