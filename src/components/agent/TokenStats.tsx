/**
 * Token 用量统计组件
 */

import { useState, useEffect } from 'react'
import { Coins, TrendingUp, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { getAgentTokenStats, estimateCost } from '../../lib/supabase/token-usage'

interface TokenStatsProps {
  agentId: string
}

export function TokenStats({ agentId }: TokenStatsProps) {
  const [stats, setStats] = useState<{
    totalInput: number
    totalOutput: number
    total: number
    byModel: Record<string, { input: number; output: number; total: number }>
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)

  useEffect(() => {
    loadStats()
  }, [agentId, days])

  const loadStats = async () => {
    setLoading(true)
    const data = await getAgentTokenStats(agentId, days)
    setStats(data)
    setLoading(false)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-4">
          <div className="text-sm text-gray-500">加载中...</div>
        </CardContent>
      </Card>
    )
  }

  if (!stats || stats.total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5" />
            Token 用量
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">暂无用量数据</p>
        </CardContent>
      </Card>
    )
  }

  // 计算预估费用
  const models = Object.entries(stats.byModel)
  let totalCost = 0
  for (const [model, usage] of models) {
    totalCost += estimateCost(usage.input, usage.output, model)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="w-5 h-5" />
          Token 用量
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 时间选择 */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="text-sm border rounded px-2 py-1"
          >
            <option value={7}>最近 7 天</option>
            <option value={30}>最近 30 天</option>
            <option value={90}>最近 90 天</option>
          </select>
        </div>

        {/* 总用量 */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {(stats.totalInput / 1000).toFixed(1)}K
            </div>
            <div className="text-xs text-gray-500">输入</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {(stats.totalOutput / 1000).toFixed(1)}K
            </div>
            <div className="text-xs text-gray-500">输出</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {(stats.total / 1000).toFixed(1)}K
            </div>
            <div className="text-xs text-gray-500">总计</div>
          </div>
        </div>

        {/* 预估费用 */}
        <div className="flex items-center gap-2 pt-2 border-t">
          <TrendingUp className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            预估费用: <span className="font-semibold">${totalCost.toFixed(4)}</span>
          </span>
        </div>

        {/* 按模型统计 */}
        {models.length > 1 && (
          <div className="pt-2 border-t">
            <div className="text-sm font-medium mb-2">按模型</div>
            {models.map(([model, usage]) => (
              <div key={model} className="flex justify-between text-sm py-1">
                <span className="text-gray-600">{model}</span>
                <span className="font-mono">{(usage.total / 1000).toFixed(1)}K</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
