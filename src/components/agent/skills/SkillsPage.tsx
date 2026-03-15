/**
 * SkillsPage - Agent 技能管理
 * 技能 = Prompt 模板 + Connector 能力组合
 */

import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, Trash2, Zap, Check, X, Loader2, Sparkles } from 'lucide-react'
import { PageContainer } from '@components/layout/PageContainer'
import { Card, CardContent, CardHeader } from '@components/ui/Card'
import { Button } from '@components/ui/Button'
import { Badge } from '@components/ui/Badge'
import { Input } from '@components/ui/Input'
import { Modal } from '@components/ui/Modal'
import { toast } from '@stores/toastStore'
import { getAgent, updateAgent } from '@lib/supabase/agents'

// 预定义技能模板
const SKILL_TEMPLATES = [
  {
    id: 'code-review',
    name: '代码审查',
    description: '专业的代码审查技能，提供代码质量建议和优化',
    category: 'engineering',
    prompt: `你是一个专业的代码审查专家。你的职责是：
1. 检查代码的正确性
2. 发现潜在的性能问题
3. 检查代码规范
4. 提供改进建议

请对提供的代码进行详细审查，并给出具体的改进建议。`,
    connectors: ['github'],
  },
  {
    id: 'copywriter',
    name: '文案撰写',
    description: '专业文案撰写，支持多种风格和场景',
    category: 'content',
    prompt: `你是一个专业的文案撰写专家。你擅长：
1. 产品文案
2. 营销文案
3. 社交媒体内容
4. 广告文案

根据用户需求，创建吸引人的文案内容。`,
    connectors: [],
  },
  {
    id: 'customer-service',
    name: '客服助手',
    description: '智能客服，支持问答和情绪安抚',
    category: 'service',
    prompt: `你是一个热情专业的客服助手。你的职责是：
1. 回答客户问题
2. 提供产品信息
3. 处理投诉和建议
4. 保持积极友好的态度

请根据客户的问题提供帮助。`,
    connectors: [],
  },
  {
    id: 'data-analyst',
    name: '数据分析',
    description: '数据分析技能，支持数据可视化和报告生成',
    category: 'analytics',
    prompt: `你是一个专业的数据分析师。你的职责是：
1. 分析数据趋势
2. 生成数据报告
3. 提供洞察建议
4. 创建数据可视化

请对提供的数据进行分析并给出建议。`,
    connectors: [],
  },
]

interface Skill {
  id: string
  name: string
  description: string
  category: string
  prompt: string
  enabled: boolean
}

const CATEGORIES = [
  { value: 'engineering', label: '工程', icon: '💻' },
  { value: 'content', label: '内容', icon: '✍️' },
  { value: 'service', label: '客服', icon: '💬' },
  { value: 'analytics', label: '分析', icon: '📊' },
  { value: 'custom', label: '自定义', icon: '⚙️' },
]

export function SkillsPage() {
  const { id: agentId } = useParams<{ id: string }>()
  const [agent, setAgent] = useState<any>(null)
  const [skills, setSkills] = useState<Skill[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [newSkill, setNewSkill] = useState({
    name: '',
    description: '',
    category: 'custom',
    prompt: '',
  })

  useEffect(() => {
    if (agentId) {
      loadAgent()
    }
  }, [agentId])

  const loadAgent = async () => {
    try {
      const data = await getAgent(agentId!)
      setAgent(data)
      // 从 agent 配置中加载 skills
      const agentSkills = data.profile?.skills || []
      setSkills(agentSkills)
    } catch (error) {
      console.error('Failed to load agent:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!agentId) return
    setIsSaving(true)
    try {
      await updateAgent(agentId, {
        profile: {
          ...agent.profile,
          skills,
        },
      })
      toast.success('技能保存成功')
    } catch (error) {
      console.error('Failed to save:', error)
      toast.error('保存失败')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddTemplate = (template: typeof SKILL_TEMPLATES[0]) => {
    const newSkill: Skill = {
      id: template.id,
      name: template.name,
      description: template.description,
      category: template.category,
      prompt: template.prompt,
      enabled: true,
    }
    setSkills([...skills, newSkill])
    setIsModalOpen(false)
  }

  const handleAddCustom = () => {
    if (!newSkill.name || !newSkill.prompt) {
      toast.error('请填写技能名称和 prompt')
      return
    }
    const skill: Skill = {
      id: `custom-${Date.now()}`,
      name: newSkill.name,
      description: newSkill.description,
      category: newSkill.category,
      prompt: newSkill.prompt,
      enabled: true,
    }
    setSkills([...skills, skill])
    setIsModalOpen(false)
    setNewSkill({ name: '', description: '', category: 'custom', prompt: '' })
  }

  const handleToggleSkill = (skillId: string) => {
    setSkills(skills.map(s => 
      s.id === skillId ? { ...s, enabled: !s.enabled } : s
    ))
  }

  const handleDeleteSkill = (skillId: string) => {
    setSkills(skills.filter(s => s.id !== skillId))
  }

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer
      title="Skills"
      description="管理 Agent 技能"
    >
      {/* 头部 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-gray-500">
            共 {skills.length} 个技能，{skills.filter(s => s.enabled).length} 个已启用
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave} disabled={isSaving}>
            {isSaving ? '保存中...' : '保存更改'}
          </Button>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            添加技能
          </Button>
        </div>
      </div>

      {/* 技能列表 */}
      {skills.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Zap className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">暂无技能</p>
            <p className="text-sm text-gray-400 mb-4">
              添加技能来增强 Agent 的能力
            </p>
            <Button onClick={() => setIsModalOpen(true)}>
              添加第一个技能
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {skills.map((skill) => (
            <Card key={skill.id} className={skill.enabled ? '' : 'opacity-60'}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggleSkill(skill.id)}
                      className={`mt-1 w-5 h-5 rounded border flex items-center justify-center ${
                        skill.enabled 
                          ? 'bg-primary-600 border-primary-600' 
                          : 'border-gray-300'
                      }`}
                    >
                      {skill.enabled && <Check className="w-3 h-3 text-white" />}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{skill.name}</h3>
                        <Badge variant="outline">
                          {CATEGORIES.find(c => c.value === skill.category)?.label || skill.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{skill.description}</p>
                      <details className="mt-2">
                        <summary className="text-sm text-gray-400 cursor-pointer">
                          查看 Prompt
                        </summary>
                        <pre className="mt-2 p-3 bg-gray-50 rounded text-sm whitespace-pre-wrap">
                          {skill.prompt}
                        </pre>
                      </details>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDeleteSkill(skill.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 添加技能弹窗 */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="添加技能"
        size="lg"
      >
        <div className="space-y-4">
          {/* 模板选择 */}
          <div>
            <label className="block text-sm font-medium mb-2">从模板选择</label>
            <div className="grid grid-cols-2 gap-2">
              {SKILL_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  className="p-3 border rounded-lg text-left hover:border-primary-500 transition-colors"
                  onClick={() => handleAddTemplate(template)}
                >
                  <div className="font-medium text-sm">{template.name}</div>
                  <div className="text-xs text-gray-500">{template.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-sm text-gray-400">或自定义</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* 自定义技能 */}
          <div>
            <label className="block text-sm font-medium mb-1">技能名称</label>
            <Input
              placeholder="输入技能名称"
              value={newSkill.name}
              onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">描述</label>
            <Input
              placeholder="简短描述"
              value={newSkill.description}
              onChange={(e) => setNewSkill({ ...newSkill, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">分类</label>
            <select
              className="w-full border rounded-lg px-3 py-2"
              value={newSkill.category}
              onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Prompt</label>
            <textarea
              className="w-full border rounded-lg px-3 py-2 min-h-32"
              placeholder="输入技能的系统提示词..."
              value={newSkill.prompt}
              onChange={(e) => setNewSkill({ ...newSkill, prompt: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleAddCustom}>
              添加自定义技能
            </Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  )
}
