/**
 * Auth 登录组件
 */

import { useState } from 'react'
import { supabase } from '@lib/supabase/client'
import { logger } from '@lib/logger'
import { PageContainer } from '@components/layout/PageContainer'
import { Button } from '@components/ui/Button'
import { Input } from '@components/ui/Input'
import { Card, CardHeader, CardContent } from '@components/ui/Card'

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    logger.info('Auth attempt', { isLogin, email })

    try {
      if (isLogin) {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (authError) {
          logger.error('Login failed', authError)
          setError(authError.message)
        } else {
          logger.info('Login successful', { userId: data.user?.id })
          setMessage('登录成功！正在跳转...')
          setTimeout(() => {
            window.location.href = '/'
          }, 1000)
        }
      } else {
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
        })

        if (authError) {
          logger.error('Signup failed', authError)
          setError(authError.message)
        } else {
          logger.info('Signup successful', { userId: data.user?.id })
          setMessage('注册成功！请检查邮箱验证链接。')
        }
      }
    } catch (err: any) {
      logger.error('Auth exception', err)
      const errorMsg = err?.message || err?.error?.message || '网络错误，请检查网络连接'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageContainer>
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <h1 className="text-xl font-semibold text-center">
              {isLogin ? '登录' : '注册'}
            </h1>
            <p className="text-sm text-gray-500 text-center mt-1">
              {isLogin ? '登录到 Agent Platform' : '创建新账户'}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  邮箱
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  密码
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="至少6位"
                  required
                  minLength={6}
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded">
                  {error}
                </div>
              )}

              {message && (
                <div className="p-3 bg-green-50 text-green-600 text-sm rounded">
                  {message}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? '处理中...' : (isLogin ? '登录' : '注册')}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              {isLogin ? (
                <>
                  没有账户？{' '}
                  <button
                    type="button"
                    onClick={() => setIsLogin(false)}
                    className="text-primary-600 hover:underline"
                  >
                    立即注册
                  </button>
                </>
              ) : (
                <>
                  已有账户？{' '}
                  <button
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className="text-primary-600 hover:underline"
                  >
                    立即登录
                  </button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
