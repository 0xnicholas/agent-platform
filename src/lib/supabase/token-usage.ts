/**
 * Token 用量追踪
 * 记录 LLM API 调用产生的 token 消耗
 */

import { supabase } from './client'

export interface TokenUsageRecord {
  workspace_id?: string
  user_id?: string
  agent_id: string
  model: string
  input_tokens: number
  output_tokens: number
  total_tokens: number
  source_type?: 'chat' | 'task' | 'rag'
  source_id?: string
}

/**
 * 记录 token 用量
 */
export async function recordTokenUsage(record: TokenUsageRecord): Promise<void> {
  const { error } = await supabase
    .from('token_usage')
    .insert({
      workspace_id: record.workspace_id,
      user_id: record.user_id,
      agent_id: record.agent_id,
      model: record.model,
      input_tokens: record.input_tokens,
      output_tokens: record.output_tokens,
      total_tokens: record.total_tokens,
      source_type: record.source_type || 'chat',
      source_id: record.source_id,
    })

  if (error) {
    console.error('Failed to record token usage:', error)
  }
}

/**
 * 获取 Agent 的 token 用量统计
 */
export async function getAgentTokenStats(agentId: string, days: number = 30) {
  const since = new Date()
  since.setDate(since.getDate() - days)

  const { data, error } = await supabase
    .from('token_usage')
    .select('model, input_tokens, output_tokens, total_tokens, created_at')
    .eq('agent_id', agentId)
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to get token stats:', error)
    return null
  }

  // 汇总统计
  const stats = {
    totalInput: 0,
    totalOutput: 0,
    total: 0,
    byModel: {} as Record<string, { input: number; output: number; total: number }>,
  }

  for (const item of data || []) {
    stats.totalInput += item.input_tokens
    stats.totalOutput += item.output_tokens
    stats.total += item.total_tokens

    if (!stats.byModel[item.model]) {
      stats.byModel[item.model] = { input: 0, output: 0, total: 0 }
    }
    stats.byModel[item.model].input += item.input_tokens
    stats.byModel[item.model].output += item.output_tokens
    stats.byModel[item.model].total += item.total_tokens
  }

  return stats
}

/**
 * 获取用户的 token 用量统计
 */
export async function getUserTokenStats(userId: string, days: number = 30) {
  const since = new Date()
  since.setDate(since.getDate() - days)

  const { data, error } = await supabase
    .from('token_usage')
    .select('model, input_tokens, output_tokens, total_tokens, created_at')
    .eq('user_id', userId)
    .gte('created_at', since.toISOString())

  if (error) {
    console.error('Failed to get user token stats:', error)
    return null
  }

  const stats = {
    totalInput: 0,
    totalOutput: 0,
    total: 0,
    byModel: {} as Record<string, number>,
  }

  for (const item of data || []) {
    stats.totalInput += item.input_tokens
    stats.totalOutput += item.output_tokens
    stats.total += item.total_tokens

    stats.byModel[item.model] = (stats.byModel[item.model] || 0) + item.total_tokens
  }

  return stats
}

/**
 * 计算预估费用（按模型定价）
 */
export function estimateCost(
  inputTokens: number,
  outputTokens: number,
  model: string
): number {
  // 定价（单位：$/1M tokens）
  const PRICING: Record<string, { input: number; output: number }> = {
    'kimi-turbo': { input: 0.5, output: 1.5 },      // ¥3.5/1M input, ¥10.5/1M output
    'kimi-pro': { input: 2.0, output: 6.0 },
    'minimax-abab6.5s': { input: 1.0, output: 1.0 },
    'minimax-abab6.5g': { input: 1.0, output: 1.0 },
    'claude-sonnet-4-6': { input: 3.0, output: 15.0 },
    'gpt-4o': { input: 2.5, output: 10.0 },
    'gpt-4o-mini': { input: 0.15, output: 0.6 },
  }

  const pricing = PRICING[model] || { input: 1.0, output: 1.0 }
  const cost = (inputTokens / 1_000_000) * pricing.input + (outputTokens / 1_000_000) * pricing.output

  return cost
}
