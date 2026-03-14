/**
 * Settings 页面
 */

import { PageContainer } from '@components/layout/PageContainer'
import { Card, CardHeader, CardContent } from '@components/ui/Card'
import { Input } from '@components/ui/Input'
import { Button } from '@components/ui/Button'
import { Badge } from '@components/ui/Badge'
import { useState } from 'react'

export function SettingsPage() {
  const [apiKeys, setApiKeys] = useState({
    kimi: '',
    minimax: '',
    openai: '',
  })

  return (
    <PageContainer
      title="设置"
      description="管理你的账户和应用设置"
    >
      <div className="max-w-2xl space-y-6">
        {/* API Keys */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold">API Keys</h2>
            <p className="text-sm text-gray-500">配置 LLM 服务商 API Keys</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kimi API Key
              </label>
              <Input
                type="password"
                placeholder="sk-..."
                value={apiKeys.kimi}
                onChange={(e) => setApiKeys({ ...apiKeys, kimi: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                MiniMax API Key
              </label>
              <Input
                type="password"
                placeholder="sk-..."
                value={apiKeys.minimax}
                onChange={(e) => setApiKeys({ ...apiKeys, minimax: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                OpenAI API Key
              </label>
              <Input
                type="password"
                placeholder="sk-..."
                value={apiKeys.openai}
                onChange={(e) => setApiKeys({ ...apiKeys, openai: e.target.value })}
              />
            </div>
            <Button>保存</Button>
          </CardContent>
        </Card>

        {/* Profile */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold">个人资料</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                邮箱
              </label>
              <Input placeholder="your@email.com" disabled />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                用户名
              </label>
              <Input placeholder="用户名" />
            </div>
            <Button>保存</Button>
          </CardContent>
        </Card>

        {/* Plan */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold">订阅计划</h2>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Free Plan</p>
                <p className="text-sm text-gray-500">100K tokens / 月</p>
              </div>
              <Badge variant="success">当前计划</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
