/**
 * Marketplace 页面 - Agent 市场
 */

import { useState } from 'react'
import { Search, Filter, Star, Download, ExternalLink } from 'lucide-react'
import { PageContainer } from '@components/layout/PageContainer'
import { Card, CardContent } from '@components/ui/Card'
import { Button } from '@components/ui/Button'
import { Input } from '@components/ui/Input'
import { Badge } from '@components/ui/Badge'
import { Avatar } from '@components/ui/Avatar'

interface MarketplaceAgent {
  id: string
  name: string
  description: string
  author: {
    name: string
    avatar?: string
  }
  category: string
  rating: number
  downloads: number
  tags: string[]
}

const MOCK_AGENTS: MarketplaceAgent[] = [
  {
    id: '1',
    name: '客服小助手',
    description: '专业的客服助手，支持常见问题解答和情绪安抚',
    author: { name: '官方' },
    category: 'customer_service',
    rating: 4.8,
    downloads: 1234,
    tags: ['客服', '售前', '售后'],
  },
  {
    id: '2',
    name: '编程导师',
    description: '帮助你学习编程，解答技术问题',
    author: { name: 'DevTeam' },
    category: 'programming',
    rating: 4.9,
    downloads: 2345,
    tags: ['编程', '教学', '代码审查'],
  },
]

const CATEGORIES = [
  { value: 'all', label: '全部' },
  { value: 'customer_service', label: '客服' },
  { value: 'sales', label: '销售' },
  { value: 'programming', label: '编程' },
  { value: 'education', label: '教育' },
  { value: 'legal', label: '法律' },
  { value: 'finance', label: '金融' },
]

export function MarketplacePage() {
  const [agents] = useState<MarketplaceAgent[]>(MOCK_AGENTS)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')

  const filteredAgents = agents.filter(agent => {
    const matchSearch = agent.name.toLowerCase().includes(search.toLowerCase()) ||
      agent.description.toLowerCase().includes(search.toLowerCase())
    const matchCategory = category === 'all' || agent.category === category
    return matchSearch && matchCategory
  })

  return (
    <PageContainer
      title="Agent 市场"
      description="发现和使用社区创建的 Agent"
    >
      {/* 搜索和筛选 */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="搜索 Agent..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.value}
              variant={category === cat.value ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setCategory(cat.value)}
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Agent 列表 */}
      {filteredAgents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">没有找到匹配的 Agent</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAgents.map((agent) => (
            <Card key={agent.id} className="hover:shadow-md transition-shadow">
              <CardContent>
                <div className="flex items-start gap-3">
                  <Avatar size="lg">
                    {agent.name[0]}
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {agent.name}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                      {agent.description}
                    </p>
                  </div>
                </div>

                {/* 标签 */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {agent.tags.map((tag) => (
                    <Badge key={tag} variant="default" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* 统计 */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t">
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      {agent.rating}
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      {agent.downloads}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      预览
                    </Button>
                    <Button size="sm">
                      使用
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 发布引导 */}
      <Card className="mt-8">
        <CardContent className="py-8 text-center">
          <h3 className="font-medium text-lg mb-2">创建自己的 Agent？</h3>
          <p className="text-gray-500 mb-4">
            将你的 Agent 发布到市场，与更多人分享
          </p>
          <Button>
            发布 Agent
          </Button>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
