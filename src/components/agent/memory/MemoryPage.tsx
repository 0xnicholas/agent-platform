/**
 * MemoryPage Agent 记忆管理页面
 */

import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, Trash2, Edit2, Save, X, Brain, Clock } from 'lucide-react'
import { PageContainer } from '../../layout/PageContainer'
import { Button } from '../../ui/Button'
import { Card, CardContent, CardHeader } from '../../ui/Card'
import { Input } from '../../ui/Input'
import { Badge } from '../../ui/Badge'
import { Modal } from '../../ui/Modal'
import { getMemories, createMemory, updateMemory, deleteMemory, type Memory } from '@lib/supabase/memories'
import { getAgent } from '@lib/supabase/agents'
import type { Agent } from '@types/agent'

const memoryTypes = [
  { value: 'fact', label: '事实', color: 'blue' },
  { value: 'preference', label: '偏好', color: 'purple' },
  { value: 'context', label: '上下文', color: 'green' },
  { value: 'behavior', label: '行为模式', color: 'orange' },
]

export function MemoryPage() {
  const { id: agentId } = useParams<{ id: string }>()
  const [agent, setAgent] = useState<Agent | null>(null)
  const [memories, setMemories] = useState<Memory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [form, setForm] = useState({
    type: 'fact',
    content: '',
  })

  useEffect(() => {
    if (agentId) {
      loadData()
    }
  }, [agentId])

  const loadData = async () => {
    if (!agentId) return
    try {
      const [agentData, memoriesData] = await Promise.all([
        getAgent(agentId),
        getMemories(agentId),
      ])
      setAgent(agentData)
      setMemories(memoriesData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!agentId || !form.content.trim()) return

    try {
      if (editingId) {
        await updateMemory(editingId, { type: form.type, content: form.content })
      } else {
        await createMemory(agentId, { type: form.type, content: form.content })
      }
      setForm({ type: 'fact', content: '' })
      setIsModalOpen(false)
      setEditingId(null)
      loadData()
    } catch (error) {
      console.error('Failed to save memory:', error)
    }
  }

  const handleEdit = (memory: Memory) => {
    setForm({ type: memory.type, content: memory.content })
    setEditingId(memory.id)
    setIsModalOpen(true)
  }

  const handleDelete = async (memoryId: string) => {
    if (!confirm('确定要删除这条记忆吗？')) return
    try {
      await deleteMemory(memoryId)
      loadData()
    } catch (error) {
      console.error('Failed to delete memory:', error)
    }
  }

  const getTypeBadge = (type: string) => {
    const found = memoryTypes.find(t => t.value === type)
    return found ? found.label : type
  }

  const getTypeColor = (type: string) => {
    const found = memoryTypes.find(t => t.value === type)
    switch (found?.color) {
      case 'blue': return 'bg-blue-100 text-blue-700'
      case 'purple': return 'bg-purple-100 text-purple-700'
      case 'green': return 'bg-green-100 text-green-700'
      case 'orange': return 'bg-orange-100 text-orange-700'
      default: return 'bg-gray-100 text-gray-700'
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
          <Brain className="w-6 h-6" />
          记忆管理
        </h1>
        <p className="text-gray-500 mt-1">
          管理 {agent?.name} 的长期记忆
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {memoryTypes.map(type => {
          const count = memories.filter(m => m.type === type.value).length
          return (
            <Card key={type.value}>
              <CardContent className="py-4">
                <div className="text-2xl font-semibold text-gray-900">{count}</div>
                <div className="text-sm text-gray-500">{type.label}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 记忆列表 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <h2 className="font-semibold">记忆列表</h2>
            <p className="text-sm text-gray-500">共 {memories.length} 条记忆</p>
          </div>
          <Button onClick={() => { setForm({ type: 'fact', content: '' }); setEditingId(null); setIsModalOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            添加记忆
          </Button>
        </CardHeader>
        
        {memories.length === 0 ? (
          <CardContent className="py-12 text-center">
            <Brain className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">还没有记忆</p>
            <p className="text-sm text-gray-400 mb-4">
              添加记忆帮助 Agent 记住重要信息
            </p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              添加第一条记忆
            </Button>
          </CardContent>
        ) : (
          <div className="divide-y">
            {memories.map(memory => (
              <div key={memory.id} className="p-4 flex items-start justify-between hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getTypeColor(memory.type)}`}>
                      {getTypeBadge(memory.type)}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(memory.created_at).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{memory.content}</p>
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(memory)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(memory.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 添加/编辑 Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingId(null); }}
        title={editingId ? '编辑记忆' : '添加记忆'}
        footer={
          <>
            <Button variant="outline" onClick={() => { setIsModalOpen(false); setEditingId(null); }}>
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={!form.content.trim()}>
              <Save className="w-4 h-4 mr-2" />
              保存
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">类型</label>
            <div className="flex flex-wrap gap-2">
              {memoryTypes.map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setForm({ ...form, type: type.value })}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    form.type === type.value
                      ? getTypeColor(type.value)
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">内容</label>
            <textarea
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              rows={4}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="输入记忆内容..."
            />
          </div>
        </div>
      </Modal>
    </PageContainer>
  )
}
