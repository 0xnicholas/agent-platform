/**
 * TeamDetailPage - 团队详情页
 * 成员管理、执行
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Plus, Trash2, Play, ArrowLeft, Loader2, Save, 
  Bot, Settings, History, CheckCircle, XCircle
} from 'lucide-react'
import { PageContainer } from '@components/layout/PageContainer'
import { Button } from '@components/ui/Button'
import { Card, CardContent, CardHeader } from '@components/ui/Card'
import { Badge } from '@components/ui/Badge'
import { Input } from '@components/ui/Input'
import { Modal } from '@components/ui/Modal'
import { toast } from '@stores/toastStore'
import { 
  getTeam, 
  updateTeam, 
  addTeamMember, 
  removeTeamMember,
  executeTeam,
  getTeamExecutions,
  type TeamWithMembers,
  type TeamMember,
  type OrchestrationMode,
  type TeamExecution 
} from '@lib/supabase/teams'
import { getAgents } from '@lib/supabase/agents'

const modeLabels: Record<OrchestrationMode, string> = {
  sequential: '串行',
  parallel: '并行',
  hierarchical: '层级',
  router: '路由',
  ensemble: '集成',
}

const roleLabels = {
  coordinator: '协调者',
  worker: '执行者',
  specialist: '专家',
}

export function TeamDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [team, setTeam] = useState<TeamWithMembers | null>(null)
  const [allAgents, setAllAgents] = useState<{ id: string; name: string; avatar_url?: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  
  // 执行任务
  const [taskInput, setTaskInput] = useState('')
  const [executions, setExecutions] = useState<TeamExecution[]>([])
  const [showExecutions, setShowExecutions] = useState(false)
  
  // 添加成员 Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedAgentId, setSelectedAgentId] = useState('')
  const [selectedRole, setSelectedRole] = useState<'coordinator' | 'worker' | 'specialist'>('worker')
  const [responsibilities, setResponsibilities] = useState('')

  useEffect(() => {
    if (id) {
      loadData()
    }
  }, [id])

  const loadData = async () => {
    if (!id) return
    try {
      const [teamData, agentsData, executionsData] = await Promise.all([
        getTeam(id),
        getAgents(),
        getTeamExecutions(id),
      ])
      setTeam(teamData)
      setAllAgents(agentsData)
      setExecutions(executionsData)
    } catch (error) {
      console.error('Failed to load team:', error)
      toast.error('加载团队失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateTeam = async () => {
    if (!team || !id) return
    setIsSaving(true)
    try {
      await updateTeam(id, {
        name: team.name,
        description: team.description,
        mode: team.mode,
      })
      toast.success('团队更新成功')
    } catch (error) {
      console.error('Failed to update team:', error)
      toast.error('更新失败')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddMember = async () => {
    if (!id || !selectedAgentId) {
      toast.error('请选择 Agent')
      return
    }

    try {
      await addTeamMember({
        team_id: id,
        agent_id: selectedAgentId,
        role: selectedRole,
        responsibilities: responsibilities.split('\n').filter(r => r.trim()),
        order_index: team?.members.length || 0,
      })
      toast.success('成员添加成功')
      setIsAddModalOpen(false)
      setSelectedAgentId('')
      setSelectedRole('worker')
      setResponsibilities('')
      loadData()
    } catch (error) {
      console.error('Failed to add member:', error)
      toast.error('添加成员失败')
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('确定要移除这个成员吗？')) return

    try {
      await removeTeamMember(memberId)
      toast.success('成员已移除')
      loadData()
    } catch (error) {
      console.error('Failed to remove member:', error)
      toast.error('移除成员失败')
    }
  }

  const handleExecute = async () => {
    if (!id || !taskInput.trim()) {
      toast.error('请输入任务')
      return
    }

    setIsExecuting(true)
    try {
      const result = await executeTeam(id, taskInput)
      toast.success('任务执行完成')
      setTaskInput('')
      loadData()
    } catch (error) {
      console.error('Failed to execute:', error)
      toast.error('执行失败')
    } finally {
      setIsExecuting(false)
    }
  }

  // 过滤掉已添加的 Agent
  const availableAgents = allAgents.filter(
    agent => !team?.members.some(m => m.agent_id === agent.id)
  )

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
        </div>
      </PageContainer>
    )
  }

  if (!team) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <p className="text-gray-500">团队不存在</p>
          <Button variant="outline" onClick={() => navigate('/teams')} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回列表
          </Button>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer
      title={team.name}
      description={team.description || 'Agent 编排团队'}
      actions={
        <Button variant="outline" onClick={() => navigate('/teams')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：团队信息 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 团队配置 */}
          <Card>
            <CardHeader>
              <h3 className="font-medium">团队配置</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="名称"
                value={team.name}
                onChange={(e) => setTeam({ ...team, name: e.target.value })}
              />
              <Input
                label="描述"
                value={team.description || ''}
                onChange={(e) => setTeam({ ...team, description: e.target.value })}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  编排模式
                </label>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(modeLabels) as OrchestrationMode[]).map((mode) => (
                    <Badge 
                      key={mode}
                      variant={team.mode === mode ? 'primary' : 'default'}
                      className="cursor-pointer"
                      onClick={() => setTeam({ ...team, mode })}
                    >
                      {modeLabels[mode]}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button onClick={handleUpdateTeam} disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                保存配置
              </Button>
            </CardContent>
          </Card>

          {/* 成员管理 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h3 className="font-medium">团队成员 ({team.members.length})</h3>
              <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
                <Plus className="w-4 h-4 mr-1" />
                添加 Agent
              </Button>
            </CardHeader>
            <CardContent>
              {team.members.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  还没有成员，请添加 Agent
                </div>
              ) : (
                <div className="space-y-3">
                  {team.members.map((member, index) => (
                    <div 
                      key={member.id} 
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400 text-sm">{index + 1}</span>
                        {member.agent?.avatar_url ? (
                          <img 
                            src={member.agent.avatar_url} 
                            alt={member.agent.name}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                            <Bot className="w-4 h-4 text-primary-600" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{member.agent?.name || 'Unknown'}</p>
                          <Badge variant="default" className="text-xs">
                            {roleLabels[member.role]}
                          </Badge>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 右侧：执行 */}
        <div className="space-y-6">
          {/* 执行任务 */}
          <Card>
            <CardHeader>
              <h3 className="font-medium">执行任务</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="输入任务描述..."
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                multiline
                rows={3}
              />
              <Button 
                className="w-full" 
                onClick={handleExecute}
                disabled={isExecuting || team.members.length === 0}
              >
                {isExecuting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    执行中...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    执行
                  </>
                )}
              </Button>
              {team.members.length === 0 && (
                <p className="text-xs text-gray-500 text-center">
                  请先添加成员
                </p>
              )}
            </CardContent>
          </Card>

          {/* 执行历史 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h3 className="font-medium">执行历史</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowExecutions(!showExecutions)}>
                <History className="w-4 h-4" />
              </Button>
            </CardHeader>
            {showExecutions && (
              <CardContent>
                {executions.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">暂无执行记录</p>
                ) : (
                  <div className="space-y-2">
                    {executions.slice(0, 5).map((exec) => (
                      <div 
                        key={exec.id} 
                        className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                      >
                        <span className="truncate flex-1">{exec.input_task}</span>
                        {exec.status === 'completed' ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : exec.status === 'failed' ? (
                          <XCircle className="w-4 h-4 text-red-500" />
                        ) : (
                          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        </div>
      </div>

      {/* 添加成员 Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="添加 Agent 到团队"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleAddMember}>添加</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择 Agent
            </label>
            {availableAgents.length === 0 ? (
              <p className="text-sm text-gray-500">没有可添加的 Agent</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {availableAgents.map((agent) => (
                  <label
                    key={agent.id}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedAgentId === agent.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="agent"
                      value={agent.id}
                      checked={selectedAgentId === agent.id}
                      onChange={(e) => setSelectedAgentId(e.target.value)}
                      className="sr-only"
                    />
                    {agent.avatar_url ? (
                      <img src={agent.avatar_url} alt={agent.name} className="w-8 h-8 rounded-full" />
                    ) : (
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-primary-600" />
                      </div>
                    )}
                    <span>{agent.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              角色
            </label>
            <div className="flex gap-2">
              {(['coordinator', 'worker', 'specialist'] as const).map((role) => (
                <Badge
                  key={role}
                  variant={selectedRole === role ? 'primary' : 'default'}
                  className="cursor-pointer"
                  onClick={() => setSelectedRole(role)}
                >
                  {roleLabels[role]}
                </Badge>
              ))}
            </div>
          </div>
          <Input
            label="职责 (每行一条)"
            placeholder="负责处理用户问题..."
            value={responsibilities}
            onChange={(e) => setResponsibilities(e.target.value)}
            multiline
            rows={3}
          />
        </div>
      </Modal>
    </PageContainer>
  )
}
