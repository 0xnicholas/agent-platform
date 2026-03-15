/**
 * Kimi Provider 实现
 * 月之暗面 LLM API
 */

import type { Message, ModelConfig, LLMResponse, ToolDefinition } from '../types'

interface KimiRequestBody {
  model: string
  messages: Array<{
    role: 'system' | 'user' | 'assistant'
    content: string
  }>
  temperature?: number
  max_tokens?: number
  stream?: boolean
  tools?: ToolDefinition[]
}

interface KimiResponse {
  id: string
  choices: Array<{
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

const BASE_URL = 'https://api.moonshot.cn/v1'

/**
 * 调用 Kimi API
 */
export async function callKimi(
  systemPrompt: string,
  messages: Message[],
  tools: ToolDefinition[] | undefined,
  modelConfig: ModelConfig,
  apiKey: string
): Promise<LLMResponse> {
  const url = `${BASE_URL}/chat/completions`

  const body: KimiRequestBody = {
    model: modelConfig.model,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role as 'system' | 'user' | 'assistant',
        content: m.content,
      })),
    ],
    temperature: modelConfig.temperature ?? 0.7,
    max_tokens: modelConfig.maxTokens ?? 4096,
  }

  if (tools && tools.length > 0) {
    body.tools = tools.map((tool) => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.inputSchema,
      },
    }))
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Kimi API error: ${response.status} - ${error}`)
  }

  const data: KimiResponse = await response.json()
  const choice = data.choices[0]

  // 解析 tool_calls（如果有）
  let toolCalls: LLMResponse['toolCalls']
  // Kimi 当前版本可能不直接返回 tool_calls，需要根据 finish_reason 判断

  return {
    content: choice.message.content || '',
    toolCalls,
    stopReason: mapFinishReason(choice.finish_reason),
    usage: {
      inputTokens: data.usage.prompt_tokens,
      outputTokens: data.usage.completion_tokens,
    },
    model: modelConfig.model,
  }
}

/**
 * 流式调用 Kimi API
 */
export async function* streamKimi(
  systemPrompt: string,
  messages: Message[],
  tools: ToolDefinition[] | undefined,
  modelConfig: ModelConfig,
  apiKey: string
): AsyncGenerator<{ type: 'text'; text: string } | { type: 'done'; usage: { inputTokens: number; outputTokens: number } } | { type: 'error'; message: string }> {
  const url = `${BASE_URL}/chat/completions`

  const body: KimiRequestBody = {
    model: modelConfig.model,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role as 'system' | 'user' | 'assistant',
        content: m.content,
      })),
    ],
    temperature: modelConfig.temperature ?? 0.7,
    max_tokens: modelConfig.maxTokens ?? 4096,
    stream: true,
  }

  if (tools && tools.length > 0) {
    body.tools = tools.map((tool) => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.inputSchema,
      },
    }))
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const error = await response.text()
    yield { type: 'error', message: `Kimi API error: ${response.status} - ${error}` }
    return
  }

  if (!response.body) {
    yield { type: 'error', message: 'No response body' }
    return
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let inputTokens = 0
  let outputTokens = 0

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data: ')) continue

        const data = trimmed.slice(6)
        if (data === '[DONE]') {
          yield { type: 'done', usage: { inputTokens, outputTokens } }
          return
        }

        try {
          const parsed = JSON.parse(data)
          const delta = parsed.choices?.[0]?.delta

          if (delta?.content) {
            yield { type: 'text', text: delta.content }
            outputTokens += countTokens(delta.content)
          }

          if (parsed.usage) {
            inputTokens = parsed.usage.prompt_tokens || 0
          }
        } catch {
          // 跳过无效 JSON
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}

function mapFinishReason(reason: string): LLMResponse['stopReason'] {
  switch (reason) {
    case 'stop':
      return 'end_turn'
    case 'length':
      return 'max_tokens'
    case 'tool_calls':
      return 'tool_use'
    default:
      return 'end_turn'
  }
}

function countTokens(text: string): number {
  // 简单估算：中文字符约等于 2 tokens，英文约 1.5
  const chinese = text.match(/[\u4e00-\u9fa5]/g)?.length || 0
  const english = text.length - chinese
  return Math.ceil(chinese * 2 + english * 1.5)
}
