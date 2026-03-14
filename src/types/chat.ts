/**
 * Chat 相关类型定义
 */

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt?: string
  toolCalls?: ToolCall[]
  isLoading?: boolean
}

export interface ToolCall {
  id: string
  name: string
  input: Record<string, unknown>
  status: 'pending' | 'executing' | 'completed' | 'error'
  result?: string
}

export interface ChatState {
  messages: Message[]
  isLoading: boolean
  isStreaming: boolean
  error: string | null
}

export interface SendMessageParams {
  content: string
  agentId: string
}
