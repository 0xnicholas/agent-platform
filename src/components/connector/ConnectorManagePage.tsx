/**
 * 全局 Connector 管理页面
 * 管理全局可用的连接器配置
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Trash2, Edit2, Save, X, Plug, Zap, CheckCircle, XCircle, Settings, ExternalLink, Key } from 'lucide-react'
import { PageContainer } from '@components/layout/PageContainer'
import { Button } from '@components/ui/Button'
import { Card, CardContent, CardHeader } from '@components/ui/Card'
import { Input } from '@components/ui/Input'
import { Badge } from '@components/ui/Badge'
import { Modal } from '@components/ui/Modal'
import { supabase } from '@lib/supabase/client'

interface GlobalConnector {
  id: string
  workspace_id: string
  type: string
  name: string
  config: any
  is_active: boolean
  created_at: string
  updated_at: string
}

// 可用的 Connector 类型
interface ConnectorTypeInfo {
  type: string
  name: string
  icon: string
  description: string
  color: string
  authUrl?: string
  fields: { key: string; label: string; type: string }[]
}

const connectorTypes: ConnectorTypeInfo[] = [
  {
    type: 'feishu',
    name: '飞书',
    icon: '🐜',
    description: '飞书消息、卡片、Bot',
    color: 'bg-blue-500',
    authUrl: 'https://open.feishu.cn/open-apis/authen/v1/authorize',
    fields: [
      { key: 'app_id', label: 'App ID', type: 'text' },
      { key: 'app_secret', label: 'App Secret', type: 'password' },
    ],
  },
  {
    type: 'slack',
    name: 'Slack',
    icon: '💬',
    description: 'Slack 消息、频道管理',
    color: 'bg-purple-500',
    authUrl: 'https://slack.com/oauth/v2/authorize',
    fields: [
      { key: 'client_id', label: 'Client ID', type: 'text' },
      { key: 'client_secret', label: 'Client Secret', type: 'password' },
      { key: 'signing_secret', label: 'Signing Secret', type: 'password' },
    ],
  },
  {
    type: 'github',
    name: 'GitHub',
    icon: '🐙',
    description: 'GitHub 仓库、Issue、PR',
    color: 'bg-gray-800',
    authUrl: 'https://github.com/login/oauth/authorize',
    fields: [
      { key: 'client_id', label: 'Client ID', type: 'text' },
      { key: 'client_secret', label: 'Client Secret', type: 'password' },
    ],
  },
]

export function ConnectorManagePage() {
  const [connectors, setConnectors] = useState<GlobalConnector[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<any>({
    type: 'feishu',
    name: '',
    config: {},
  })

  useEffect(() => {
    loadConnectors()
  }, [])

  const loadConnectors = async () => {
    try {
      const { data, error } = await supabase
        .from('connectors')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setConnectors(data || [])
    } catch (error) {
      console.error('Failed to load connectors:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) return

    try {
      if (editingId) {
        await supabase
          .from('connectors')
          .update({
            name: form.name,
            config: form.config,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId)
      } else {
        // 创建新连接器（需要 workspace_id）
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // 获取用户的默认 workspace
        const { data: members } = await supabase
          .from('workspace_members')
          .select('workspace_id')
          .eq('user_id', user.id)
          .limit(1)

        const workspaceId = members?.[0]?.workspace_id

        await supabase
          .from('connectors')
          .insert({
            workspace_id: workspaceId,
            type: form.type,
            name: form.name,
            config: form.config,
            is_active: true,
          })
      }
      
      setForm({ type: 'feishu', name: '', config: {} })
      setIsModalOpen(false)
      setEditingId(null)
      loadConnectors()
    } catch (error) {
      console.error('Failed to save connector:', error)
    }
  }

  const handleEdit = (connector: GlobalConnector) => {
    setForm({
      type: connector.type,
      name: connector.name,
      config: connector.config || {},
    })
    setEditingId(connector.id)
    setIsModalOpen(true)
  }

  const handleDelete = async (connectorId: string) => {
    if (!confirm('确定要删除这个连接器吗？')) return
    try {
      await supabase.from('connectors').delete().eq('id', connectorId)
      loadConnectors()
    } catch (error) {
      console.error('Failed to delete connector:', error)
    }
  }

  const handleToggle = async (connector: GlobalConnector) => {
    try {
      await supabase
        .from('connectors')
        .update({ is_active: !connector.is_active })
        .eq('id', connector.id)
      loadConnectors()
    } catch (error) {
      console.error('Failed to toggle connector:', error)
    }
  }

  const getConnectorInfo = (type: string) => {
    return connectorTypes.find(c => c.type === type) || { 
      type, 
      name: type, 
      icon: '🔌', 
      description: '',
      color: 'bg-gray-500',
      fields: [],
    }
  }

  const getConnectorFields = (type: string) => {
    const info = getConnectorInfo(type)
    return info.fields || []
  }

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full" />
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer
      title="连接器管理"
      description="管理全局第三方服务连接器"
      actions={
        <Button onClick={() => { setForm({ type: 'feishu', name: '', config: {} }); setEditingId(null); setIsModalOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          添加连接器
        </Button>
      }
    >
      {/* 可用连接器类型说明 */}
      <div className="mb-6">
        <h2 className="text-sm font-medium text-gray-500 mb-3">支持的连接器</h2>
        <div className="grid grid-cols-3 gap-4">
          {connectorTypes.map(connector => (
            <Card key={connector.type}>
              <CardContent className="py-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{connector.icon}</span>
                  <div>
                    <div className="font-medium">{connector.name}</div>
                    <div className="text-xs text-gray-500">{connector.description}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 已配置的连接器 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <h2 className="font-semibold">已配置的连接器</h2>
            <p className="text-sm text-gray-500">共 {connectors.length} 个连接器</p>
          </div>
        </CardHeader>
        
        {connectors.length === 0 ? (
          <CardContent className="py-12 text-center">
            <Plug className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">还没有配置任何连接器</p>
            <p className="text-sm text-gray-400 mb-4">
              添加连接器让 Agent 能够与外部服务交互
            </p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              添加第一个连接器
            </Button>
          </CardContent>
        ) : (
          <div className="divide-y">
            {connectors.map(connector => {
              const info = getConnectorInfo(connector.type)
              const configKeys = connector.config ? Object.keys(connector.config).filter(k => k !== 'access_token') : []
              
              return (
                <div key={connector.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${info.color}`}>
                      <span className="text-xl">{info.icon}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">{connector.name}</h3>
                        <Badge variant={connector.is_active ? 'success' : 'default'}>
                          {connector.is_active ? '已启用' : '已禁用'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">{info.name}</p>
                      {configKeys.length > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <Key className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-400">
                            {configKeys.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleToggle(connector)}
                      title={connector.is_active ? '禁用' : '启用'}
                    >
                      {connector.is_active ? (
                        <XCircle className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Zap className="w-4 h-4 text-green-500" />
                      )}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(connector)}>
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(connector.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* 添加/编辑 Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingId(null); }}
        title={editingId ? '编辑连接器' : '添加连接器'}
        footer={
          <>
            <Button variant="outline" onClick={() => { setIsModalOpen(false); setEditingId(null); }}>
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={!form.name.trim()}>
              <Save className="w-4 h-4 mr-2" />
              保存
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {!editingId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">连接器类型</label>
              <div className="grid grid-cols-3 gap-2">
                {connectorTypes.map(type => (
                  <button
                    key={type.type}
                    type="button"
                    onClick={() => setForm({ ...form, type: type.type, config: {} })}
                    className={`p-3 rounded-lg border text-center transition-colors ${
                      form.type === type.type
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{type.icon}</div>
                    <div className="text-sm font-medium">{type.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <Input
            label="名称"
            placeholder="连接器名称"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          
          {/* 动态配置字段 */}
          {getConnectorFields(form.type).map(field => (
            <Input
              key={field.key}
              label={field.label}
              type={field.type}
              placeholder={`请输入 ${field.label}`}
              value={form.config[field.key] || ''}
              onChange={(e) => setForm({ 
                ...form, 
                config: { ...form.config, [field.key]: e.target.value } 
              })}
            />
          ))}

          {/* OAuth 链接 */}
          {getConnectorInfo(form.type).authUrl && (
            <div className="pt-2">
              <a
                href={getConnectorInfo(form.type).authUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                前往 {getConnectorInfo(form.type).name} 开发者后台获取凭证
              </a>
            </div>
          )}
        </div>
      </Modal>
    </PageContainer>
  )
}
