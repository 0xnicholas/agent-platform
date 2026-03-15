/**
 * LLM Shared Module
 * Kimi API 调用
 */

const KIMI_BASE_URL = 'https://api.moonshot.cn/v1'

interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface LLMOptions {
  systemPrompt: string
  messages: Message[]
  tools?: unknown[]
  modelConfig: {
    model: string
    apiKey?: string
    temperature?: number
    maxTokens?: number
  }
}

export async function callLLM(options: LLMOptions) {
  const { systemPrompt, messages, modelConfig } = options
  const apiKey = modelConfig.apiKey || Deno.env.get('KIMI_API_KEY')!

  const allMessages = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ]

  const response = await fetch(`${KIMI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelConfig.model || 'kimi-turbo',
      messages: allMessages,
      temperature: modelConfig.temperature || 0.7,
      max_tokens: modelConfig.maxTokens || 4096,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Kimi API error: ${error}`)
  }

  const data = await response.json()
  return {
    content: data.choices[0]?.message?.content || '',
    usage: data.usage,
  }
}

export async function* streamLLM(options: LLMOptions): AsyncGenerator<{ type: string; content?: string }> {
  const { systemPrompt, messages, modelConfig } = options
  const apiKey = modelConfig.apiKey || Deno.env.get('KIMI_API_KEY')!

  const allMessages = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ]

  const response = await fetch(`${KIMI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelConfig.model || 'kimi-turbo',
      messages: allMessages,
      temperature: modelConfig.temperature || 0.7,
      max_tokens: modelConfig.maxTokens || 4096,
      stream: true,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Kimi API error: ${error}`)
  }

  const reader = response.body?.getReader()
  const decoder = new TextDecoder()

  if (!reader) {
    throw new Error('No response body')
  }

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ') && !line.includes('[DONE]')) {
          const data = JSON.parse(line.slice(6))
          const content = data.choices[0]?.delta?.content
          if (content) {
            yield { type: 'content', content }
          }
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}
