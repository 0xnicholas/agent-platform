/**
 * IntegrationsPage Agent 集成配置页面
 */

import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, Trash2, Edit2, Save, X, Plug, Zap, CheckCircle, XCircle, Settings } from 'lucide-react'
import { PageContainer } from '../../layout/PageContainer'
import { Button } from '../../ui/Button'
import { Card, CardContent, CardHeader } from '../../ui/Card'
import { Input } from '../../ui/Input'
import { Badge } from '../../ui/Badge'
import { Modal } from '../../ui/Modal'
import { 
  getConnectors, 
  createConnector, 
  updateConnector, 
  deleteConnector, 
  toggleConnector, 
  connectorTypes,
  type Connector 
} from '@lib/supabase/connectors'
import { getAgent } from '@lib/supabase/agents'
import type { Agent } from '@types/agent'

export function IntegrationsPage() {
  const { id: agentId } = useParams<{ id: string }>()
  const [agent, setAgent] = useState<Agent | null>(null)
  const [connectors, setConnectors] = useState<Connector[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [form, setForm] = useState({
    type: 'feishu',
    name: '',
    credentials_ref: '',
  })

  useEffect(() => {
    if (agentId) {
      loadData()
    }
  }, [agentId])

  const loadData = async () => {
    if (!agentId) return
    try {
      const [agentData, connectorsData] = await Promise.all([
        getAgent(agentId),
        getConnectors(agentId),
      ])
      setAgent(agentData)
      setConnectors(connectorsData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!agentId || !form.name.trim()) return

    try {
      if (editingId) {
        await updateConnector(editingId, { 
          name: form.name,
          credentials_ref: form.credentials_ref,
        })
      } else {
        await createConnector(agentId, { 
          type: form.type,
          name: form.name,
          credentials_ref: form.credentials_ref,
        })
      }
      setForm({ type: 'feishu', name: '', credentials_ref: '' })
      setIsModalOpen(false)
      setEditingId(null)
      loadData()
    } catch (error) {
      console.error('Failed to save connector:', error)
    }
  }

  const handleEdit = (connector: Connector) => {
    setForm({ 
      type: connector.type, 
      name: connector.name, 
      credentials_ref: connector.credentials_ref || '' 
    })
    setEditingId(connector.id)
    setIsModalOpen(true)
  }

  const handleDelete = async (connectorId: string) => {
    if (!confirm('确定要删除这个集成吗？')) return
    try {
      await deleteConnector(connectorId)
      loadData()
    } catch (error) {
      console.error('Failed to delete connector:', error)
    }
  }

  const handleToggle = async (connector: Connector) => {
    try {
      await toggleConnector(connector.id, !connector.is_active)
      loadData()
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
      tools: [] 
    }
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
    <PageContainer>
      {/* 头部信息 */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
          <Plug className="w-6 h-6" />
          集成配置
        </h1>
        <p className="text-gray-500 mt-1">
          管理 {agent?.name} 的第三方集成
        </p>
      </div>

      {/* 可用集成类型 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {connectorTypes.map(connector => {
          const isConnected = connectors.some(c => c.type === connector.type)
          return (
            <Card key={connector.type} className={isConnected ? 'ring-2 ring-green-500' : ''}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{connector.icon}</span>
                      <h3 className="font-semibold text-gray-900">{connector.name}</h3>
                      {isConnected && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{connector.description}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {connector.tools.slice(0, 3).map(tool => (
                    <Badge key={tool} variant="outline" className="text-xs">
                      {tool}
                    </Badge>
                  ))}
                  {connector.tools.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{connector.tools.length - 3}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 已连接的集成 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <h2 className="font-semibold">已连接的集成</h2>
            <p className="text-sm text-gray-500">共 {connectors.length} 个集成</p>
          </div>
          <Button onClick={() => { setForm({ type: 'feishu', name: '', credentials_ref: '' }); setEditingId(null); setIsModalOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            添加集成
          </Button>
        </CardHeader>
        
        {connectors.length === 0 ? (
          <CardContent className="py-12 text-center">
            <Plug className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">还没有连接任何集成</p>
            <p className="text-sm text-gray-400 mb-4">
              添加集成让 Agent 能够与外部服务交互
            </p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              添加第一个集成
            </Button>
          </CardContent>
        ) : (
          <div className="divide-y">
            {connectors.map(connector => {
              const info = getConnectorInfo(connector.type)
              return (
                <div key={connector.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      connector.is_active ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
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
        title={editingId ? '编辑集成' : '添加集成'}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">集成类型</label>
              <div className="grid grid-cols-3 gap-2">
                {connectorTypes.map(type => (
                  <button
                    key={type.type}
                    type="button"
                    onClick={() => setForm({ ...form, type: type.type })}
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
            placeholder="集成名称"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              凭证引用 (credentials_ref)
            </label>
            <Input
              placeholder="例如: feishu-bot-001"
              value={form.credentials_ref}
              onChange={(e) => setForm({ ...form, credentials_ref: e.target.value })}
            />
            <p className="mt-1 text-xs text-gray-500">
              关联到 Secrets 中的凭证 key
            </p>
          </div>

          {/* 工具预览 */}
          {(() => {
            const info = getConnectorInfo(form.type)
            return (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  可用工具
                </label>
                <div className="flex flex-wrap gap-1">
                  {info.tools.map(tool => (
                    <Badge key={tool} variant="outline" className="text-xs">
                      {tool}
                    </Badge>
                  ))}
                </div>
              </div>
            )
          })()}
        </div>
      </Modal>
    </PageContainer>
  )
}
