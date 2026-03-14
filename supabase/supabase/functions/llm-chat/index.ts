/**
 * LLM Chat Edge Function
 * 处理 Agent 对话请求
 */

import { createClient } from "npm:@supabase/supabase-js@2"

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const KIMI_API_KEY = Deno.env.get('KIMI_API_KEY')!
const KIMI_BASE_URL = 'https://api.moonshot.cn/v1'

interface RequestBody {
  agentId: string
  messages: Array<{
    role: 'user' | 'assistant' | 'system'
    content: string
  }>
  stream?: boolean
}

async function callLLM(systemPrompt: string, messages: any[], model: string) {
  const allMessages = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ]

  const response = await fetch(`${KIMI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${KIMI_API_KEY}`,
    },
    body: JSON.stringify({
      model: model || 'kimi-turbo',
      messages: allMessages,
      temperature: 0.7,
      max_tokens: 4096,
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

async function* streamLLM(systemPrompt: string, messages: any[], model: string): AsyncGenerator<{ type: string; content?: string }> {
  const allMessages = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ]

  const response = await fetch(`${KIMI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${KIMI_API_KEY}`,
    },
    body: JSON.stringify({
      model: model || 'kimi-turbo',
      messages: allMessages,
      temperature: 0.7,
      max_tokens: 4096,
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

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { agentId, messages, stream = false } = await req.json() as RequestBody

    // 验证用户
    const authHeader = req.headers.get('Authorization')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 获取 Agent 配置
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single()

    if (agentError || !agent) {
      return new Response(JSON.stringify({ error: 'Agent not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 构建 System Prompt
    const profile = agent.profile || {}
    const systemPrompt = buildSystemPrompt(profile)

    // 构建消息
    const llmMessages = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }))

    // 流式响应
    if (stream) {
      const encoder = new TextEncoder()
      const streamResult = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of streamLLM(systemPrompt, llmMessages, agent.model_config?.model || 'kimi-turbo')) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`))
            }
            controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          } catch (error) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`))
          }
          controller.close()
        },
      })

      return new Response(streamResult, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    }

    // 非流式响应
    const response = await callLLM(systemPrompt, llmMessages, agent.model_config?.model || 'kimi-turbo')

    // 保存对话
    await supabase.from('conversations').upsert({
      agent_id: agentId,
      user_id: user.id,
      messages: [...messages, { role: 'assistant', content: response.content }],
    })

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

function buildSystemPrompt(profile: Record<string, unknown>): string {
  const parts = []

  if (profile.identity) parts.push(`# 角色设定\n${profile.identity}`)
  if (profile.principles) parts.push(`# 行为原则\n${profile.principles}`)
  if (profile.tone) parts.push(`# 沟通风格\n${profile.tone}`)
  if (profile.userContext) parts.push(`# 用户背景\n${profile.userContext}`)

  parts.push(`# 当前时间\n${new Date().toISOString()}`)

  return parts.join('\n\n')
}
