/**
 * Agent API 客户端
 * 使用直接 fetch 调用 Edge Functions
 */

import { logger } from '../logger'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${supabaseAnonKey}`,
  'apikey': supabaseAnonKey,
}

export interface Agent {
  id: string
  name: string
  description?: string
  avatar_url?: string
  profile: {
    identity?: string
    principles?: string
    tone?: string
    userContext?: string
  }
  model_config: {
    model: string
    temperature?: number
    maxTokens?: number
  }
  is_published: boolean
  total_conversations: number
  total_tasks_run: number
  created_at: string
  updated_at: string
}

export interface CreateAgentInput {
  name: string
  description?: string
  avatar_url?: string
  profile?: Agent['profile']
  model_config?: Agent['model_config']
  is_published?: boolean
}

/**
 * 获取所有 Agent
 */
export async function getAgents(): Promise<Agent[]> {
  logger.info('Fetching agents...')
  
  const response = await fetch(`${supabaseUrl}/functions/v1/agents`, {
    method: 'GET',
    headers,
  })

  if (!response.ok) {
    const error = await response.json()
    logger.error('Failed to fetch agents', error)
    throw new Error(error.message || 'Failed to fetch agents')
  }
  
  const data = await response.json()
  logger.info('Agents fetched', { count: data.agents?.length })
  return data.agents || []
}

/**
 * 获取单个 Agent
 */
export async function getAgent(id: string): Promise<Agent> {
  logger.info('Fetching agent', { id })
  
  const response = await fetch(`${supabaseUrl}/functions/v1/agents?id=${id}`, {
    method: 'GET',
    headers,
  })

  if (!response.ok) {
    const error = await response.json()
    logger.error('Failed to fetch agent', { id, error })
    throw new Error(error.message || 'Failed to fetch agent')
  }
  
  const data = await response.json()
  logger.info('Agent fetched', { id })
  return data.agent
}

/**
 * 创建 Agent
 */
export async function createAgent(input: CreateAgentInput): Promise<Agent> {
  logger.info('Creating agent', input)
  
  const response = await fetch(`${supabaseUrl}/functions/v1/agents`, {
    method: 'POST',
    headers,
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const error = await response.json()
    logger.error('Failed to create agent', error)
    throw new Error(error.message || 'Failed to create agent')
  }
  
  const data = await response.json()
  logger.info('Agent created', { id: data.agent?.id })
  return data.agent
}

/**
 * 更新 Agent
 */
export async function updateAgent(
  id: string,
  updates: Partial<CreateAgentInput>
): Promise<Agent> {
  logger.info('Updating agent', { id, updates })
  
  const response = await fetch(`${supabaseUrl}/functions/v1/agents`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ id, ...updates }),
  })

  if (!response.ok) {
    const error = await response.json()
    logger.error('Failed to update agent', { id, error })
    throw new Error(error.message || 'Failed to update agent')
  }
  
  const data = await response.json()
  logger.info('Agent updated', { id })
  return data.agent
}

/**
 * 删除 Agent
 */
export async function deleteAgent(id: string): Promise<void> {
  logger.info('Deleting agent', { id })
  
  const response = await fetch(`${supabaseUrl}/functions/v1/agents`, {
    method: 'DELETE',
    headers,
    body: JSON.stringify({ id }),
  })

  if (!response.ok) {
    const error = await response.json()
    logger.error('Failed to delete agent', { id, error })
    throw new Error(error.message || 'Failed to delete agent')
  }
  
  logger.info('Agent deleted', { id })
}

/**
 * 复制 Agent
 */
export async function duplicateAgent(id: string): Promise<Agent> {
  logger.info('Duplicating agent', { id })
  const original = await getAgent(id)
  
  const duplicate = await createAgent({
    name: `${original.name} (副本)`,
    description: original.description,
    profile: original.profile,
    model_config: original.model_config,
  })
  
  logger.info('Agent duplicated', { originalId: id, newId: duplicate.id })
  return duplicate
}
