/**
 * Chat API - 与 Agent 对话
 */

import { supabase } from './client'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ChatRequest {
  agentId: string
  messages: ChatMessage[]
  model?: string
  temperature?: number
}

export interface ChatResponse {
  message: ChatMessage
  usage?: {
    input_tokens: number
    output_tokens: number
  }
}

/**
 * 发送消息到 Agent
 */
export async function sendChatMessage(
  agentId: string,
  messages: ChatMessage[],
  options?: {
    model?: string
    temperature?: number
  }
): Promise<ChatResponse> {
  const { data, error } = await supabase.functions.invoke('llm-chat', {
    body: {
      agent_id: agentId,
      messages,
      model: options?.model,
      temperature: options?.temperature,
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

/**
 * 流式发送消息到 Agent
 */
export async function sendChatMessageStream(
  agentId: string,
  messages: ChatMessage[],
  onChunk: (content: string) => void,
  options?: {
    model?: string
    temperature?: number
  }
): Promise<void> {
  // 使用 EventSource 进行 SSE 流式读取
  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/llm-chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
    },
    body: JSON.stringify({
      agent_id: agentId,
      messages,
      stream: true,
      model: options?.model,
      temperature: options?.temperature,
    }),
  })

  if (!response.ok) {
    throw new Error(`Chat failed: ${response.statusText}`)
  }

  const reader = response.body?.getReader()
  const decoder = new TextDecoder()

  if (!reader) {
    throw new Error('Failed to read response')
  }

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') {
            return
          }
          try {
            const parsed = JSON.parse(data)
            if (parsed.content) {
              onChunk(parsed.content)
            }
          } catch {
            // 忽略解析错误
          }
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}

/**
 * 保存对话到数据库
 */
export async function saveConversation(
  agentId: string,
  messages: ChatMessage[]
): Promise<string> {
  const { data, error } = await supabase
    .from('conversations')
    .insert({
      agent_id: agentId,
      title: messages[0]?.content?.slice(0, 50) || '新对话',
      messages: messages,
    })
    .select('id')
    .single()

  if (error) throw error
  return data.id
}

/**
 * 获取对话历史
 */
export async function getConversationHistory(
  agentId: string,
  limit: number = 50
): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('messages')
    .eq('agent_id', agentId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  
  // 返回最近一次对话的消息
  if (data && data.length > 0) {
    return data[0].messages as ChatMessage[]
  }
  
  return []
}
