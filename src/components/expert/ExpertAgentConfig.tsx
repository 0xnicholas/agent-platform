/**
 * Expert Agent 配置页面
 */

import { useState } from 'react'
import { PageContainer } from '@components/layout/PageContainer'
import { Card, CardHeader, CardContent } from '@components/ui/Card'
import { Button } from '@components/ui/Button'
import { Input } from '@components/ui/Input'
import { Badge } from '@components/ui/Badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@components/ui/Tabs'
import { 
  DOMAIN_LABELS, 
  DOMAIN_DESCRIPTIONS, 
  type ExpertDomain,
  type CaseStudy,
  type FAQ 
} from '../types/expert'

interface ExpertAgentConfigProps {
  agentId: string
}

export function ExpertAgentConfig({ agentId }: ExpertAgentConfigProps) {
  const [domain, setDomain] = useState<ExpertDomain>('customer_service')
  const [expertise, setExpertise] = useState<string[]>([])
  const [newExpertise, setNewExpertise] = useState('')
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([])
  const [faqs, setFaqs] = useState<FAQ[]>([])

  const addExpertise = () => {
    if (newExpertise.trim() && !expertise.includes(newExpertise.trim())) {
      setExpertise([...expertise, newExpertise.trim()])
      setNewExpertise('')
    }
  }

  const removeExpertise = (item: string) => {
    setExpertise(expertise.filter(e => e !== item))
  }

  return (
    <PageContainer
      title="Expert Agent 配置"
      description="配置专业领域的 Expert Agent"
    >
      <Tabs defaultValue="domain">
        <TabsList>
          <TabsTrigger value="domain">领域</TabsTrigger>
          <TabsTrigger value="expertise">专业技能</TabsTrigger>
          <TabsTrigger value="cases">案例库</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>

        {/* 领域选择 */}
        <TabsContent value="domain">
          <Card>
            <CardHeader>
              <h2 className="font-semibold">选择领域</h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(DOMAIN_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setDomain(key as ExpertDomain)}
                    className={`p-4 border rounded-lg text-left transition-all ${
                      domain === key
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{label}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {DOMAIN_DESCRIPTIONS[key as ExpertDomain]}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 专业技能 */}
        <TabsContent value="expertise">
          <Card>
            <CardHeader>
              <h2 className="font-semibold">专业技能</h2>
              <p className="text-sm text-gray-500">添加 Agent 需要掌握的专业技能</p>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="输入专业技能..."
                  value={newExpertise}
                  onChange={(e) => setNewExpertise(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addExpertise()}
                />
                <Button onClick={addExpertise}>添加</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {expertise.map((skill) => (
                  <Badge key={skill} variant="info" className="px-3 py-1">
                    {skill}
                    <button
                      onClick={() => removeExpertise(skill)}
                      className="ml-2 text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
                {expertise.length === 0 && (
                  <p className="text-gray-400 text-sm">暂无专业技能</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 案例库 */}
        <TabsContent value="cases">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <h2 className="font-semibold">案例库</h2>
                <p className="text-sm text-gray-500">添加典型案例供 Agent 学习</p>
              </div>
              <Button size="sm">添加案例</Button>
            </CardHeader>
            <CardContent>
              {caseStudies.length === 0 ? (
                <p className="text-gray-400 text-center py-8">暂无案例</p>
              ) : (
                <div className="space-y-3">
                  {caseStudies.map((study) => (
                    <div key={study.id} className="p-3 border rounded-lg">
                      <div className="font-medium">{study.title}</div>
                      <div className="text-sm text-gray-500 mt-1">{study.description}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* FAQ */}
        <TabsContent value="faq">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <h2 className="font-semibold">常见问题</h2>
                <p className="text-sm text-gray-500">配置常见问题和答案</p>
              </div>
              <Button size="sm">添加 FAQ</Button>
            </CardHeader>
            <CardContent>
              {faqs.length === 0 ? (
                <p className="text-gray-400 text-center py-8">暂无 FAQ</p>
              ) : (
                <div className="space-y-3">
                  {faqs.map((faq) => (
                    <div key={faq.id} className="p-3 border rounded-lg">
                      <div className="font-medium">Q: {faq.question}</div>
                      <div className="text-sm text-gray-600 mt-1">A: {faq.answer}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}
