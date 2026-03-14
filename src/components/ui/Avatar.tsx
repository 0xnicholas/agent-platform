/**
 * Avatar 头像
 */

import { HTMLAttributes } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { User } from 'lucide-react'

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
}

export function Avatar({ 
  className, 
  src, 
  alt, 
  size = 'md',
  ...props 
}: AvatarProps) {
  return (
    <div
      className={twMerge(
        clsx(
          'relative rounded-full overflow-hidden bg-gray-200 flex items-center justify-center',
          sizeClasses[size],
          className
        )
      )}
      {...props}
    >
      {src ? (
        <img src={src} alt={alt || ''} className="w-full h-full object-cover" />
      ) : (
        <User className="w-1/2 h-1/2 text-gray-500" />
      )}
    </div>
  )
}
