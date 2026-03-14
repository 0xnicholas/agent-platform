/**
 * LLM 类型定义
 * 统一的 LLM 接口类型
 */

export type MessageRole = 'system' | 'user' | 'assistant' | 'tool'

export interface Message {
  role: MessageRole
  content: string
  toolCallId?: string
}

export interface ToolDefinition {
  name: string
  description: string
  inputSchema: {
    type: 'object'
    properties: Record<string, unknown>
    required?: string[]
  }
}

export interface ToolCall {
  id: string
  name: string
  input: Record<string, unknown>
}

export type ModelId =
  | 'kimi-turbo'
  | 'kimi-pro'
  | 'minimax-abab6.5s'
  | 'minimax-abab6.5g'
  | 'minimax-abab6.5'
  | 'claude-sonnet-4-6'
  | 'claude-opus-4-6'
  | 'gpt-4o'
  | 'gpt-4o-mini'
  | 'gemini-2.0-flash'

export interface ModelConfig {
  model: ModelId
  maxTokens?: number
  temperature?: number
  topP?: number
}

export interface LLMRequest {
  systemPrompt: string
  messages: Message[]
  tools?: ToolDefinition[]
  modelConfig: ModelConfig
  stream?: boolean
  metadata?: {
    workspaceId: string
    agentId: string
    sourceType: 'conversation' | 'task_run'
    sourceId: string
  }
}

export interface LLMResponse {
  content: string
  toolCalls?: ToolCall[]
  stopReason: 'end_turn' | 'tool_use' | 'max_tokens' | 'error'
  usage: {
    inputTokens: number
    outputTokens: number
  }
  model: string
}

export type StreamChunk =
  | { type: 'text'; text: string }
  | { type: 'tool_call'; toolCall: ToolCall }
  | { type: 'done'; usage: LLMResponse['usage'] }
  | { type: 'error'; message: string }

// Provider 类型
export type Provider = 'kimi' | 'minimax' | 'anthropic' | 'openai' | 'google'

export function getProvider(modelId: ModelId): Provider {
  if (modelId.startsWith('kimi') || modelId.startsWith('minimax')) {
    return 'kimi'.includes(modelId) ? 'kimi' : 'minimax'
  }
  if (modelId.startsWith('claude')) return 'anthropic'
  if (modelId.startsWith('gpt')) return 'openai'
  if (modelId.startsWith('gemini')) return 'google'
  return 'kimi' // 默认
}
