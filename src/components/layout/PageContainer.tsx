/**
 * PageContainer 页面容器
 */

import { ReactNode } from 'react'

interface PageContainerProps {
  children: ReactNode
  title?: string
  description?: string
  actions?: ReactNode
}

export function PageContainer({ 
  children, 
  title, 
  description, 
  actions 
}: PageContainerProps) {
  return (
    <div className="p-6">
      {/* 页面标题 */}
      {(title || actions) && (
        <div className="flex items-start justify-between mb-6">
          <div>
            {title && (
              <h1 className="text-2xl font-semibold text-gray-900">
                {title}
              </h1>
            )}
            {description && (
              <p className="mt-1 text-sm text-gray-500">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
      )}
      
      {/* 页面内容 */}
      {children}
    </div>
  )
}
