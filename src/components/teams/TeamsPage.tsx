/**
 * Teams 页面 - Agent 编排团队管理
 */

import { useState } from 'react'
import { Plus, Users, ArrowRight, Play, Trash2, Settings } from 'lucide-react'
import { PageContainer } from '@components/layout/PageContainer'
import { Button } from '@components/ui/Button'
import { Card, CardContent } from '@components/ui/Card'
import { Badge } from '@components/ui/Badge'
import { Input } from '@components/ui/Input'
import { Modal } from '@components/ui/Modal'

interface Team {
  id: string
  name: string
  description?: string
  mode: 'sequential' | 'parallel' | 'hierarchical' | 'router' | 'ensemble'
  memberCount: number
}

const mockTeams: Team[] = []

const modeLabels = {
  sequential: '串行',
  parallel: '并行',
  hierarchical: '层级',
  router: '路由',
  ensemble: '集成',
}

export function TeamsPage() {
  const [teams] = useState<Team[]>(mockTeams)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newTeam, setNewTeam] = useState({
    name: '',
    description: '',
    mode: 'sequential' as const,
  })

  const handleCreateTeam = () => {
    // TODO: 创建团队
    setIsModalOpen(false)
    setNewTeam({ name: '', description: '', mode: 'sequential' })
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
      {teams.length === 0 ? (
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
            <Card key={team.id}>
              <CardContent>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{team.name}</h3>
                    {team.description && (
                      <p className="text-sm text-gray-500 mt-1">{team.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="info">{modeLabels[team.mode]}</Badge>
                      <span className="text-sm text-gray-400">
                        {team.memberCount} 个 Agent
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <Button variant="outline" size="sm">
                    <Play className="w-4 h-4 mr-1" />
                    运行
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
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
            <div>
              <Badge variant="default" className="mb-1">串行</Badge>
              <p className="text-gray-500">Agent 依次执行</p>
            </div>
            <div>
              <Badge variant="default" className="mb-1">并行</Badge>
              <p className="text-gray-500">Agent 同时执行</p>
            </div>
            <div>
              <Badge variant="default" className="mb-1">层级</Badge>
              <p className="text-gray-500">协调者分配任务</p>
            </div>
            <div>
              <Badge variant="default" className="mb-1">路由</Badge>
              <p className="text-gray-500">根据任务类型分发</p>
            </div>
            <div>
              <Badge variant="default" className="mb-1">集成</Badge>
              <p className="text-gray-500">多结果汇总</p>
            </div>
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
            <Button onClick={handleCreateTeam}>创建</Button>
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
              {(['sequential', 'parallel', 'hierarchical', 'router', 'ensemble'] as const).map((mode) => (
                <label
                  key={mode}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
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
                    onChange={(e) => setNewTeam({ ...newTeam, mode: e.target.value as any })}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">{modeLabels[mode]}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </PageContainer>
  )
}
