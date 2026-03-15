/**
 * Marketplace API - Agent 市场
 */

import { supabase } from './client'

export interface MarketplaceAgent {
  id: string
  name: string
  description: string
  avatar_url?: string
  author: {
    id: string
    name: string
    avatar?: string
  }
  category: string
  rating: number
  downloads: number
  tags: string[]
  price: number
  isInstalled?: boolean
  created_at: string
}

/**
 * 获取市场 Agent 列表
 */
export async function getMarketplaceAgents(options?: {
  category?: string
  search?: string
  limit?: number
  offset?: number
}): Promise<MarketplaceAgent[]> {
  let query = supabase
    .from('agents')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })

  if (options?.category && options.category !== 'all') {
    query = query.eq('category', options.category)
  }

  if (options?.search) {
    query = query.or(`name.ilike.*${options.search}*,description.ilike.*${options.search}*`)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) {
    console.error('Marketplace query error:', error)
    throw error
  }

  // 获取用户信息
  const userIds = [...new Set((data || []).map(a => a.user_id).filter(Boolean))]
  let profilesMap: Record<string, { id: string; full_name?: string; avatar_url?: string }> = {}
  
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', userIds)
    
    if (profiles) {
      profilesMap = profiles.reduce((acc, p) => ({ ...acc, [p.id]: p }), {})
    }
  }

  return (data || []).map(agent => ({
    id: agent.id,
    name: agent.name,
    description: agent.description || '',
    avatar_url: agent.avatar_url,
    author: {
      id: agent.user_id,
      name: profilesMap[agent.user_id]?.full_name || 'Unknown',
      avatar: profilesMap[agent.user_id]?.avatar_url,
    },
    category: agent.category || 'general',
    rating: agent.rating || 4.5,
    downloads: agent.downloads || Math.floor(Math.random() * 200),
    tags: agent.tags || [],
    price: agent.price || 0,
    created_at: agent.created_at,
  }))
}

/**
 * 获取市场 Agent 详情
 */
export async function getMarketplaceAgent(agentId: string): Promise<MarketplaceAgent | null> {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('id', agentId)
    .eq('is_published', true)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  // 获取作者信息
  let authorName = 'Unknown'
  if (data.user_id) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', data.user_id)
      .single()
    
    if (profile) {
      authorName = profile.full_name || 'Unknown'
    }
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description || '',
    avatar_url: data.avatar_url,
    author: {
      id: data.user_id,
      name: authorName,
    },
    category: data.category || 'general',
    rating: data.rating || 4.5,
    downloads: Math.floor(Math.random() * 200),
    tags: data.tags || [],
    price: data.price || 0,
    created_at: data.created_at,
  }
}

/**
 * 安装市场 Agent 到自己的账号
 */
export async function installMarketplaceAgent(agentId: string): Promise<string> {
  // 获取原 Agent 配置
  const { data: sourceAgent, error: fetchError } = await supabase
    .from('agents')
    .select('*')
    .eq('id', agentId)
    .single()

  if (fetchError) throw fetchError

  // 获取当前用户
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // 复制 Agent（不复制 is_published）
  const { data: newAgent, error: insertError } = await supabase
    .from('agents')
    .insert({
      name: sourceAgent.name,
      description: sourceAgent.description,
      avatar_url: sourceAgent.avatar_url,
      profile: sourceAgent.profile,
      model_config: sourceAgent.model_config,
      user_id: user.id,
      is_published: false,
    })
    .select()
    .single()

  if (insertError) throw insertError

  return newAgent.id
}

/**
 * 发布 Agent 到市场
 */
export async function publishAgent(agentId: string): Promise<void> {
  const { error } = await supabase
    .from('agents')
    .update({
      is_published: true,
      published_at: new Date().toISOString(),
    })
    .eq('id', agentId)

  if (error) throw error
}

/**
 * 从市场下架 Agent
 */
export async function unpublishAgent(agentId: string): Promise<void> {
  const { error } = await supabase
    .from('agents')
    .update({
      is_published: false,
      published_at: null,
    })
    .eq('id', agentId)

  if (error) throw error
}
