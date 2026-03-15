import { ButtonHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Loader2 } from 'lucide-react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={twMerge(
          clsx(
            'inline-flex items-center justify-center rounded-lg font-medium transition-all',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'active:scale-[0.98]',
            {
              'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500':
                variant === 'primary',
              'bg-secondary text-white hover:bg-secondary-light focus:ring-gray-500':
                variant === 'secondary',
              'bg-secondary text-white hover:bg-secondary-light focus:ring-gray-500 border-none':
                variant === 'outline',
              'bg-secondary/10 text-gray-900 hover:bg-secondary/20 focus:ring-gray-500':
                variant === 'ghost',
              'bg-secondary text-white hover:bg-secondary-light focus:ring-gray-500':
                variant === 'danger',
              'px-3 py-1.5 text-sm': size === 'sm',
              'px-4 py-2 text-sm': size === 'md',
              'px-6 py-3 text-base': size === 'lg',
            },
            className
          )
        )}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
