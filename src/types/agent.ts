/**
 * Agent 类型定义
 */

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

export interface AgentFormData {
  name: string
  description: string
  avatar_url?: string
  profile: {
    identity: string
    principles: string
    tone: string
    userContext: string
  }
  model_config: {
    model: string
    temperature: number
    maxTokens: number
  }
}
