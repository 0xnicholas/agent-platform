/**
 * Teams 页面 - Agent 编排团队管理
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Users, Play, Trash2, Settings, Loader2, ArrowRight } from 'lucide-react'
import { PageContainer } from '@components/layout/PageContainer'
import { Button } from '@components/ui/Button'
import { Card, CardContent } from '@components/ui/Card'
import { Badge } from '@components/ui/Badge'
import { Input } from '@components/ui/Input'
import { Modal } from '@components/ui/Modal'
import { toast } from '@stores/toastStore'
import { 
  getTeams, 
  createTeam, 
  deleteTeam, 
  type Team,
  type OrchestrationMode 
} from '@lib/supabase/teams'

const modeLabels: Record<OrchestrationMode, string> = {
  sequential: '串行',
  parallel: '并行',
  hierarchical: '层级',
  router: '路由',
  ensemble: '集成',
}

const modeDescriptions: Record<OrchestrationMode, string> = {
  sequential: 'Agent 依次执行，上一 Agent 输出作为下一 Agent 输入',
  parallel: '多个 Agent 同时执行，结果汇总',
  hierarchical: 'Coordinator 分析任务并分配给 Workers',
  router: '根据任务类型智能分发到合适的 Agent',
  ensemble: '所有 Agent 执行同一任务，最后汇总结果',
}

export function TeamsPage() {
  const navigate = useNavigate()
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newTeam, setNewTeam] = useState({
    name: '',
    description: '',
    mode: 'sequential' as OrchestrationMode,
  })

  useEffect(() => {
    loadTeams()
  }, [])

  const loadTeams = async () => {
    try {
      const data = await getTeams()
      setTeams(data)
    } catch (error) {
      console.error('Failed to load teams:', error)
      toast.error('加载团队失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTeam = async () => {
    if (!newTeam.name.trim()) {
      toast.error('请输入团队名称')
      return
    }

    setIsCreating(true)
    try {
      const team = await createTeam({
        name: newTeam.name,
        description: newTeam.description,
        mode: newTeam.mode,
      })
      toast.success('团队创建成功')
      setIsModalOpen(false)
      setNewTeam({ name: '', description: '', mode: 'sequential' })
      // 跳转到团队详情页
      navigate(`/teams/${team.id}`)
    } catch (error) {
      console.error('Failed to create team:', error)
      toast.error('创建团队失败')
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteTeam = async (teamId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('确定要删除这个团队吗？')) return

    try {
      await deleteTeam(teamId)
      toast.success('团队已删除')
      loadTeams()
    } catch (error) {
      console.error('Failed to delete team:', error)
      toast.error('删除团队失败')
    }
  }

  return (
    <PageContainer
      title="Teams"
      description="管理 Agent 编排团队"
      actions={
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          创建 Team
        </Button>
      }
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
        </div>
      ) : teams.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-4">还没有 Team</p>
            <p className="text-sm text-gray-400 mb-6">
              创建一个 Agent 团队来实现多 Agent 协作
            </p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              创建第一个 Team
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => (
            <Card 
              key={team.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/teams/${team.id}`)}
            >
              <CardContent>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{team.name}</h3>
                    {team.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{team.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="info">{modeLabels[team.mode]}</Badge>
                      <span className="text-sm text-gray-400">
                        {team.memberCount || 0} 个 Agent
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/teams/${team.id}`)
                    }}
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    管理
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => handleDeleteTeam(team.id, e)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 说明 */}
      <Card className="mt-6">
        <CardContent>
          <h3 className="font-medium mb-3">编排模式说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
            {(Object.keys(modeLabels) as OrchestrationMode[]).map((mode) => (
              <div key={mode}>
                <Badge variant="default" className="mb-1">{modeLabels[mode]}</Badge>
                <p className="text-gray-500">{modeDescriptions[mode]}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 创建 Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="创建 Team"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreateTeam} disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  创建中...
                </>
              ) : (
                '创建'
              )}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="名称"
            placeholder="Team 名称"
            value={newTeam.name}
            onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
          />
          <Input
            label="描述"
            placeholder="可选描述"
            value={newTeam.description}
            onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              编排模式
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(modeLabels) as OrchestrationMode[]).map((mode) => (
                <label
                  key={mode}
                  className={`flex flex-col p-3 border rounded-lg cursor-pointer transition-all ${
                    newTeam.mode === mode
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="mode"
                    value={mode}
                    checked={newTeam.mode === mode}
                    onChange={(e) => setNewTeam({ ...newTeam, mode: e.target.value as OrchestrationMode })}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">{modeLabels[mode]}</span>
                  <span className="text-xs text-gray-500 mt-1">{modeDescriptions[mode]}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </PageContainer>
  )
}
