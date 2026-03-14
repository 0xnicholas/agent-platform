/**
 * Tasks 页面
 */

import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, Play, Clock, CheckCircle, XCircle, Trash2, Zap, Calendar } from 'lucide-react'
import { PageContainer } from '@components/layout/PageContainer'
import { Button } from '@components/ui/Button'
import { Card, CardContent, CardHeader } from '@components/ui/Card'
import { Badge } from '@components/ui/Badge'
import { Input } from '@components/ui/Input'
import { Modal } from '@components/ui/Modal'
import { getTasks, createTask, deleteTask, runTask, type Task } from '@lib/supabase/tasks'
import { getAgents } from '@lib/supabase/agents'

// Cron 表达式预设
const cronPresets = [
  { label: '每天 8:00', value: '0 8 * * *' },
  { label: '每天 18:00', value: '0 18 * * *' },
  { label: '每周一 9:00', value: '0 9 * * 1' },
  { label: '每月 1 日 9:00', value: '0 9 1 * *' },
]

export function TasksPage() {
  const params = useParams()
  const agentId = params.id as string | undefined

  const [tasks, setTasks] = useState<Task[]>([])
  const [agents, setAgents] = useState<{ id: string; name: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isRunning, setIsRunning] = useState<string | null>(null)

  const [newTask, setNewTask] = useState({
    agent_id: agentId || '',
    name: '',
    description: '',
    trigger_type: 'cron',
    cron: '0 8 * * *',
    prompt: '',
  })

  useEffect(() => {
    loadData()
  }, [agentId])

  const loadData = async () => {
    try {
      const [tasksData, agentsData] = await Promise.all([
        getTasks(agentId),
        !agentId ? getAgents() : Promise.resolve([]),
      ])
      setTasks(tasksData)
      if (!agentId) setAgents(agentsData)
    } catch (error) {
      console.error('Failed to load tasks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTask = async () => {
    if (!newTask.name.trim() || !newTask.prompt.trim()) return

    try {
      await createTask({
        agent_id: agentId || newTask.agent_id,
        name: newTask.name,
        description: newTask.description,
        trigger: {
          type: newTask.trigger_type,
          expression: newTask.cron,
          timezone: 'Asia/Shanghai',
        },
        prompt: newTask.prompt,
      })
      setIsModalOpen(false)
      setNewTask({
        agent_id: agentId || '',
        name: '',
        description: '',
        trigger_type: 'cron',
        cron: '0 8 * * *',
        prompt: '',
      })
      loadData()
    } catch (error) {
      console.error('Failed to create task:', error)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('确定要删除这个任务吗？')) return
    try {
      await deleteTask(taskId)
      loadData()
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  const handleRunTask = async (taskId: string) => {
    setIsRunning(taskId)
    try {
      await runTask(taskId)
      loadData()
    } catch (error) {
      console.error('Failed to run task:', error)
    } finally {
      setIsRunning(null)
    }
  }

  const statusIcon = (status?: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'partial':
        return <Clock className="w-4 h-4 text-yellow-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleString('zh-CN')
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
      title="Tasks"
      description="管理自动化任务"
      actions={
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          创建 Task
        </Button>
      }
    >
      {tasks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Zap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">还没有 Task</p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              创建第一个 Task
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <Card key={task.id} className={!task.is_active ? 'opacity-60' : ''}>
              <CardContent className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {statusIcon(task.last_run_status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{task.name}</h3>
                      <Badge variant={task.is_active ? 'success' : 'default'}>
                        {task.is_active ? '已启用' : '已禁用'}
                      </Badge>
                    </div>
                    {task.description && (
                      <p className="text-sm text-gray-500">{task.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <Badge variant="outline">
                        {task.trigger?.type === 'cron' ? (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {task.trigger?.expression}
                          </span>
                        ) : (
                          '事件触发'
                        )}
                      </Badge>
                      {task.last_run_at && (
                        <span className="text-xs text-gray-400">
                          上次运行: {formatDate(task.last_run_at)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleRunTask(task.id)}
                    disabled={isRunning === task.id}
                    title="立即运行"
                  >
                    {isRunning === task.id ? (
                      <Clock className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 创建 Task Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="创建 Task"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreateTask} disabled={!newTask.name.trim() || !newTask.prompt.trim()}>
              创建
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {!agentId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">关联 Agent</label>
              <select
                className="w-full px-3 py-2 border rounded-lg"
                value={newTask.agent_id}
                onChange={(e) => setNewTask({ ...newTask, agent_id: e.target.value })}
              >
                <option value="">选择 Agent</option>
                {agents.map(agent => (
                  <option key={agent.id} value={agent.id}>{agent.name}</option>
                ))}
              </select>
            </div>
          )}

          <Input
            label="名称"
            placeholder="Task 名称"
            value={newTask.name}
            onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
          />
          
          <Input
            label="描述"
            placeholder="可选描述"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">触发类型</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="trigger_type"
                  checked={newTask.trigger_type === 'cron'}
                  onChange={() => setNewTask({ ...newTask, trigger_type: 'cron' })}
                />
                <span>定时触发</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="trigger_type"
                  checked={newTask.trigger_type === 'event'}
                  onChange={() => setNewTask({ ...newTask, trigger_type: 'event' })}
                />
                <span>事件触发</span>
              </label>
            </div>
          </div>

          {newTask.trigger_type === 'cron' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cron 表达式</label>
                <Input
                  placeholder="0 8 * * *"
                  value={newTask.cron}
                  onChange={(e) => setNewTask({ ...newTask, cron: e.target.value })}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {cronPresets.map(preset => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setNewTask({ ...newTask, cron: preset.value })}
                      className={`px-2 py-1 text-xs rounded ${
                        newTask.cron === preset.value
                          ? 'bg-primary-100 text-primary-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">执行 Prompt</label>
            <textarea
              className="w-full px-3 py-2 border rounded-lg"
              rows={4}
              placeholder="输入任务执行时发送给 Agent 的 prompt..."
              value={newTask.prompt}
              onChange={(e) => setNewTask({ ...newTask, prompt: e.target.value })}
            />
          </div>
        </div>
      </Modal>
    </PageContainer>
  )
}
