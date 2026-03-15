/**
 * Tasks 页面 - 任务管理
 */

import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { 
  Plus, Play, Clock, CheckCircle, XCircle, Trash2, 
  Zap, Calendar, Webhook, Timer, History, Loader2,
  ChevronDown, ChevronUp
} from 'lucide-react'
import { PageContainer } from '@components/layout/PageContainer'
import { Button } from '@components/ui/Button'
import { Card, CardContent, CardHeader } from '@components/ui/Card'
import { Badge } from '@components/ui/Badge'
import { Input } from '@components/ui/Input'
import { Modal } from '@components/ui/Modal'
import { toast } from '@stores/toastStore'
import { 
  getTasks, getTaskRuns, createTask, deleteTask, runTask, 
  type Task, type TaskRun 
} from '@lib/supabase/tasks'
import { getAgents } from '@lib/supabase/agents'

// 触发类型
const TRIGGER_TYPES = [
  { value: 'cron', label: '定时任务', icon: Calendar, description: '基于 Cron 表达式定时执行' },
  { value: 'webhook', label: 'Webhook', icon: Webhook, description: 'HTTP 请求触发' },
  { value: 'interval', label: '间隔执行', icon: Timer, description: '固定时间间隔执行' },
]

// Cron 表达式预设
const CRON_PRESETS = [
  { label: '每分钟', value: '* * * * *' },
  { label: '每5分钟', value: '*/5 * * * *' },
  { label: '每小时', value: '0 * * * *' },
  { label: '每天 8:00', value: '0 8 * * *' },
  { label: '每天 18:00', value: '0 18 * * *' },
  { label: '每周一 9:00', value: '0 9 * * 1' },
  { label: '每月 1 日 9:00', value: '0 9 1 * *' },
]

// 任务状态徽章
function TaskStatusBadge({ task }: { task: Task }) {
  if (!task.is_active) {
    return <Badge variant="default">已暂停</Badge>
  }
  
  if (task.last_run_status === 'success') {
    return <Badge variant="success">运行中</Badge>
  }
  
  if (task.last_run_status === 'failed') {
    return <Badge variant="error">失败</Badge>
  }
  
  if (task.last_run_status === 'partial') {
    return <Badge variant="warning">部分成功</Badge>
  }
  
  return <Badge variant="default">待执行</Badge>
}

// 任务运行历史
function TaskRunHistory({ taskId }: { taskId: string }) {
  const [runs, setRuns] = useState<TaskRun[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    getTaskRuns(taskId)
      .then(setRuns)
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [taskId])

  if (isLoading) {
    return <div className="py-2 text-gray-500">加载中...</div>
  }

  if (runs.length === 0) {
    return <div className="py-2 text-gray-500">暂无执行记录</div>
  }

  return (
    <div className="border-t mt-3 pt-3">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
      >
        <History className="w-4 h-4" />
        执行历史 ({runs.length})
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      
      {isExpanded && (
        <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
          {runs.map((run) => (
            <div key={run.id} className="flex items-center gap-3 text-sm p-2 bg-gray-50 rounded">
              {run.status === 'running' ? (
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              ) : run.status === 'success' ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : run.status === 'failed' ? (
                <XCircle className="w-4 h-4 text-red-500" />
              ) : (
                <Clock className="w-4 h-4 text-gray-400" />
              )}
              <span className="flex-1">
                {new Date(run.started_at).toLocaleString('zh-CN')}
              </span>
              <Badge variant={run.status === 'success' ? 'success' : run.status === 'failed' ? 'error' : 'default'}>
                {run.status}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

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
    trigger_type: 'cron' as 'cron' | 'webhook' | 'interval',
    cron: '0 8 * * *',
    interval_minutes: 60,
    webhook_url: '',
    prompt: '',
  })

  useEffect(() => {
    loadData()
  }, [agentId])

  const loadData = async () => {
    try {
      const [tasksData, agentsData] = await Promise.all([
        getTasks(agentId),
        getAgents(),
      ])
      setTasks(tasksData)
      setAgents(agentsData.map(a => ({ id: a.id, name: a.name })))
    } catch (error) {
      console.error('Failed to load tasks:', error)
      toast.error('加载失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTask = async () => {
    if (!newTask.name || !newTask.agent_id) {
      toast.error('请填写任务名称和选择 Agent')
      return
    }

    try {
      const trigger = newTask.trigger_type === 'cron' 
        ? { type: 'cron', expression: newTask.cron, timezone: 'Asia/Shanghai' }
        : newTask.trigger_type === 'webhook'
        ? { type: 'webhook', url: newTask.webhook_url }
        : { type: 'interval', minutes: newTask.interval_minutes }

      await createTask({
        agent_id: newTask.agent_id,
        name: newTask.name,
        description: newTask.description,
        trigger,
        prompt: newTask.prompt,
      })

      toast.success('任务创建成功')
      setIsModalOpen(false)
      loadData()
      setNewTask({
        agent_id: agentId || '',
        name: '',
        description: '',
        trigger_type: 'cron',
        cron: '0 8 * * *',
        interval_minutes: 60,
        webhook_url: '',
        prompt: '',
      })
    } catch (error) {
      console.error('Failed to create task:', error)
      toast.error('创建失败')
    }
  }

  const handleRunTask = async (taskId: string) => {
    setIsRunning(taskId)
    try {
      await runTask(taskId)
      toast.success('任务已开始执行')
      loadData()
    } catch (error) {
      console.error('Failed to run task:', error)
      toast.error('执行失败')
    } finally {
      setIsRunning(null)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('确定要删除这个任务吗？')) return
    
    try {
      await deleteTask(taskId)
      toast.success('删除成功')
      loadData()
    } catch (error) {
      console.error('Failed to delete task:', error)
      toast.error('删除失败')
    }
  }

  return (
    <PageContainer
      title="Tasks"
      description="管理定时和自动化任务"
    >
      {/* 头部操作 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-gray-500">
            共 {tasks.length} 个任务，{tasks.filter(t => t.is_active).length} 个活跃
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          新建任务
        </Button>
      </div>

      {/* 任务列表 */}
      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-600" />
          </CardContent>
        </Card>
      ) : tasks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Zap className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">暂无任务</p>
            <Button onClick={() => setIsModalOpen(true)}>
              创建第一个任务
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <Card key={task.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium">{task.name}</h3>
                      <TaskStatusBadge task={task} />
                    </div>
                    {task.description && (
                      <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {task.trigger?.type === 'cron' ? task.trigger?.expression : 
                         task.trigger?.type === 'interval' ? `每 ${task.trigger?.minutes} 分钟` :
                         'Webhook'}
                      </span>
                      {task.last_run_at && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          上次: {new Date(task.last_run_at).toLocaleString('zh-CN')}
                        </span>
                      )}
                    </div>
                    <TaskRunHistory taskId={task.id} />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleRunTask(task.id)}
                      disabled={isRunning === task.id}
                    >
                      {isRunning === task.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 新建任务弹窗 */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="新建任务"
        size="lg"
      >
        <div className="space-y-4">
          {/* Agent 选择 */}
          <div>
            <label className="block text-sm font-medium mb-1">选择 Agent</label>
            <select
              className="w-full border rounded-lg px-3 py-2"
              value={newTask.agent_id}
              onChange={(e) => setNewTask({ ...newTask, agent_id: e.target.value })}
            >
              <option value="">选择 Agent</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>{agent.name}</option>
              ))}
            </select>
          </div>

          {/* 任务名称 */}
          <div>
            <label className="block text-sm font-medium mb-1">任务名称</label>
            <Input
              placeholder="输入任务名称"
              value={newTask.name}
              onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
            />
          </div>

          {/* 描述 */}
          <div>
            <label className="block text-sm font-medium mb-1">描述（可选）</label>
            <Input
              placeholder="简短描述"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            />
          </div>

          {/* 触发类型 */}
          <div>
            <label className="block text-sm font-medium mb-1">触发方式</label>
            <div className="grid grid-cols-3 gap-2">
              {TRIGGER_TYPES.map((type) => (
                <button
                  key={type.value}
                  className={`p-3 border rounded-lg text-left ${
                    newTask.trigger_type === type.value 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'hover:border-gray-300'
                  }`}
                  onClick={() => setNewTask({ ...newTask, trigger_type: type.value as any })}
                >
                  <type.icon className="w-5 h-5 mb-1" />
                  <div className="font-medium text-sm">{type.label}</div>
                  <div className="text-xs text-gray-500">{type.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Cron 表达式 */}
          {newTask.trigger_type === 'cron' && (
            <div>
              <label className="block text-sm font-medium mb-1">执行时间</label>
              <select
                className="w-full border rounded-lg px-3 py-2"
                value={newTask.cron}
                onChange={(e) => setNewTask({ ...newTask, cron: e.target.value })}
              >
                {CRON_PRESETS.map((preset) => (
                  <option key={preset.value} value={preset.value}>
                    {preset.label} ({preset.value})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 间隔时间 */}
          {newTask.trigger_type === 'interval' && (
            <div>
              <label className="block text-sm font-medium mb-1">间隔（分钟）</label>
              <Input
                type="number"
                min={1}
                value={newTask.interval_minutes}
                onChange={(e) => setNewTask({ ...newTask, interval_minutes: parseInt(e.target.value) })}
              />
            </div>
          )}

          {/* Webhook URL */}
          {newTask.trigger_type === 'webhook' && (
            <div>
              <label className="block text-sm font-medium mb-1">Webhook URL</label>
              <Input
                placeholder="https://..."
                value={newTask.webhook_url}
                onChange={(e) => setNewTask({ ...newTask, webhook_url: e.target.value })}
              />
            </div>
          )}

          {/* Prompt */}
          <div>
            <label className="block text-sm font-medium mb-1">任务指令</label>
            <textarea
              className="w-full border rounded-lg px-3 py-2 min-h-24"
              placeholder="输入任务执行的指令..."
              value={newTask.prompt}
              onChange={(e) => setNewTask({ ...newTask, prompt: e.target.value })}
            />
          </div>

          {/* 提交 */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreateTask}>
              创建任务
            </Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  )
}
