/**
 * Task Run Edge Function
 * 执行定时/触发任务
 */

import { createClient } from "npm:@supabase/supabase-js@2"

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const KIMI_API_KEY = Deno.env.get('KIMI_API_KEY')!
const KIMI_BASE_URL = 'https://api.moonshot.cn/v1'

interface RequestBody {
  task_id: string
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { task_id } = await req.json() as RequestBody

    if (!task_id) {
      return new Response(JSON.stringify({ error: 'task_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 获取任务配置
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('*, agents(profile, model_config)')
      .eq('id', task_id)
      .single()

    if (taskError || !task) {
      return new Response(JSON.stringify({ error: 'Task not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const agent = task.agents
    if (!agent) {
      return new Response(JSON.stringify({ error: 'Agent not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 创建执行记录
    const { data: taskRun, error: runError } = await supabase
      .from('task_runs')
      .insert({
        task_id: task_id,
        status: 'running',
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (runError || !taskRun) {
      return new Response(JSON.stringify({ error: 'Failed to create task run' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const startTime = Date.now()

    try {
      // 构建 System Prompt
      const profile = agent.profile || {}
      const systemPrompt = buildSystemPrompt(profile)

      // 构造消息（注入 task prompt 作为 user message）
      const messages = [
        { role: 'user', content: task.prompt }
      ]

      // 调用 LLM
      const model = agent.model_config?.model || 'kimi-turbo'
      const response = await callLLM(systemPrompt, messages, model)

      const duration = Date.now() - startTime

      // 生成执行摘要
      const summary = {
        status: 'success',
        duration: duration,
        output_length: response.content.length,
        model: model,
        actions: [
          {
            type: 'llm_response',
            description: `执行完成，返回 ${response.content.length} 字符`
          }
        ],
        alerts: [] as string[],
        quickLinks: [] as { label: string; url: string }[]
      }

      // 更新任务状态
      await supabase
        .from('tasks')
        .update({
          last_run_at: new Date().toISOString(),
          last_run_status: 'success',
          last_run_summary: summary,
        })
        .eq('id', task_id)

      // 更新执行记录
      await supabase
        .from('task_runs')
        .update({
          status: 'success',
          summary: summary,
          raw_conversation: messages,
          finished_at: new Date().toISOString(),
        })
        .eq('id', taskRun.id)

      return new Response(JSON.stringify({
        success: true,
        task_run_id: taskRun.id,
        summary: summary,
        output: response.content,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })

    } catch (llmError) {
      const duration = Date.now() - startTime

      const summary = {
        status: 'failed',
        duration: duration,
        error: llmError.message,
        actions: [],
        alerts: [llmError.message],
        quickLinks: []
      }

      // 更新任务状态
      await supabase
        .from('tasks')
        .update({
          last_run_at: new Date().toISOString(),
          last_run_status: 'failed',
          last_run_summary: summary,
        })
        .eq('id', task_id)

      // 更新执行记录
      await supabase
        .from('task_runs')
        .update({
          status: 'failed',
          summary: summary,
          error_message: llmError.message,
          finished_at: new Date().toISOString(),
        })
        .eq('id', taskRun.id)

      return new Response(JSON.stringify({
        success: false,
        task_run_id: taskRun.id,
        error: llmError.message,
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

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
      model: model,
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

function buildSystemPrompt(profile: Record<string, unknown>): string {
  const parts = []

  if (profile.identity) parts.push(`# 角色设定\n${profile.identity}`)
  if (profile.principles) parts.push(`# 行为原则\n${profile.principles}`)
  if (profile.tone) parts.push(`# 沟通风格\n${profile.tone}`)
  if (profile.userContext) parts.push(`# 用户背景\n${profile.userContext}`)

  parts.push(`# 当前时间\n${new Date().toISOString()}`)
  parts.push(`# 任务模式\n你正在执行一个自动化任务，请直接给出结果，不需要询问用户问题。`)

  return parts.join('\n\n')
}
