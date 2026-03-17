/**
 * Team Execution Edge Function
 * 多 Agent 协作执行引擎
 */

import { createClient } from "npm:@supabase/supabase-js@2"

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const KIMI_API_KEY = Deno.env.get('KIMI_API_KEY')!
const KIMI_BASE_URL = 'https://api.moonshot.cn/v1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  team_id: string
  task: string
}

async function callLLM(systemPrompt: string, messages: { role: string; content: string }[], model: string = 'kimi-turbo') {
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
      model,
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { team_id, task } = await req.json() as RequestBody

    if (!team_id || !task) {
      return new Response(JSON.stringify({ error: 'team_id and task are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 获取团队信息
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('*')
      .eq('id', team_id)
      .single()

    if (teamError || !team) {
      return new Response(JSON.stringify({ error: 'Team not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 获取团队成员
    const { data: members, error: membersError } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', team_id)
      .order('order_index', { ascending: true })

    if (membersError || !members || members.length === 0) {
      return new Response(JSON.stringify({ error: 'No members in team' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 获取每个成员对应的 Agent 信息
    const agentIds = members.map(m => m.agent_id)
    const { data: agents } = await supabase
      .from('agents')
      .select('id, name, profile, model_config')
      .in('id', agentIds)

    const agentMap = new Map(agents?.map(a => [a.id, a]) || [])

    // 创建执行记录
    const { data: execution, error: execError } = await supabase
      .from('team_executions')
      .insert({
        team_id,
        status: 'running',
        input_task: task,
      })
      .select()
      .single()

    if (execError) {
      console.error('Failed to create execution record:', execError)
    }

    const results: Record<string, unknown> = {}
    let currentTask = task

    try {
      // 根据模式执行
      switch (team.mode) {
        case 'sequential':
          for (const member of members) {
            const agent = agentMap.get(member.agent_id)
            if (!agent) continue

            const systemPrompt = buildSystemPrompt(agent.profile, member)
            const response = await callLLM(systemPrompt, [{ role: 'user', content: currentTask }], agent.model_config?.model)

            results[member.agent_id] = {
              agentName: agent.name,
              content: response.content,
              usage: response.usage,
            }

            // 当前结果作为下一个 Agent 的输入
            currentTask = `Previous results:\n${JSON.stringify(results[member.agent_id], null, 2)}\n\nNow continue with the original task: ${task}`
          }
          break

        case 'parallel':
          const parallelPromises = members.map(async (member) => {
            const agent = agentMap.get(member.agent_id)
            if (!agent) return null

            const systemPrompt = buildSystemPrompt(agent.profile, member)
            const response = await callLLM(systemPrompt, [{ role: 'user', content: task }], agent.model_config?.model)

            return {
              agentId: member.agent_id,
              agentName: agent.name,
              content: response.content,
              usage: response.usage,
            }
          })

          const parallelResults = await Promise.all(parallelPromises)
          parallelResults.forEach(r => {
            if (r) results[r.agentId] = r
          })
          break

        case 'hierarchical':
          // 找到 coordinator
          const coordinator = members.find(m => m.role === 'coordinator')
          const workers = members.filter(m => m.role === 'worker' || m.role === 'specialist')

          if (coordinator) {
            const coordinatorAgent = agentMap.get(coordinator.agent_id)
            if (coordinatorAgent) {
              const coordPrompt = buildSystemPrompt(coordinatorAgent.profile, coordinator)
              const coordResponse = await callLLM(coordPrompt, [{ role: 'user', content: `Analyze and allocate this task: ${task}. List what each worker should do.` }], coordinatorAgent.model_config?.model)
              results['coordinator'] = { agentName: coordinatorAgent.name, content: coordResponse.content }
            }
          }

          // 并行执行 workers
          const workerPromises = workers.map(async (worker) => {
            const workerAgent = agentMap.get(worker.agent_id)
            if (!workerAgent) return null

            const workerPrompt = buildSystemPrompt(workerAgent.profile, worker)
            const workerResponse = await callLLM(workerPrompt, [{ role: 'user', content: task }], workerAgent.model_config?.model)

            return {
              agentId: worker.agent_id,
              agentName: workerAgent.name,
              content: workerResponse.content,
            }
          })

          const workerResults = await Promise.all(workerPromises)
          workerResults.forEach(r => {
            if (r) results[r.agentId] = r
          })
          break

        case 'router':
          // 使用第一个 Agent 作为 router
          const router = members[0]
          const routerAgent = router ? agentMap.get(router.agent_id) : null

          if (routerAgent) {
            const routerPrompt = buildSystemPrompt(routerAgent.profile, router)
            const routingResult = await callLLM(routerPrompt, [{ role: 'user', content: `Analyze this task: "${task}". Which agent should handle it? Return the agent ID.` }], routerAgent.model_config?.model)

            // 简单实现：让所有 worker 执行
            const workerResults2 = await Promise.all(
              workers.map(async (worker) => {
                const workerAgent = agentMap.get(worker.agent_id)
                if (!workerAgent) return null
                const workerPrompt = buildSystemPrompt(workerAgent.profile, worker)
                const resp = await callLLM(workerPrompt, [{ role: 'user', content: task }], workerAgent.model_config?.model)
                return { agentId: worker.agent_id, agentName: workerAgent.name, content: resp.content }
              })
            )

            results['routing'] = { content: routingResult.content }
            workerResults2.forEach(r => { if (r) results[r.agentId] = r })
          }
          break

        case 'ensemble':
          // 所有 Agent 执行同一任务，最后一个汇总
          const ensemblePromises = members.map(async (member) => {
            const agent = agentMap.get(member.agent_id)
            if (!agent) return null

            const systemPrompt = buildSystemPrompt(agent.profile, member)
            const response = await callLLM(systemPrompt, [{ role: 'user', content: task }], agent.model_config?.model)

            return { agentId: member.agent_id, agentName: agent.name, content: response.content }
          })

          const ensembleResults = await Promise.all(ensemblePromises)

          // 最后一个 Agent 汇总结果
          const summarizer = members[members.length - 1]
          const summarizerAgent = summarizer ? agentMap.get(summarizer.agent_id) : null

          const individualResults: Record<string, string> = {}
          ensembleResults.forEach(r => { if (r) individualResults[r.agentId] = r.content })

          if (summarizerAgent) {
            const summaryPrompt = `You are a summarizer. Summarize the following results from multiple agents:\n${JSON.stringify(individualResults, null, 2)}`
            const summary = await callLLM(summaryPrompt, [], summarizerAgent.model_config?.model)
            results['summary'] = { agentName: summarizerAgent.name, content: summary.content }
          }

          results['individualResults'] = individualResults
          break

        default:
          throw new Error(`Unknown mode: ${team.mode}`)
      }

      // 更新执行记录为完成
      if (execution) {
        await supabase
          .from('team_executions')
          .update({
            status: 'completed',
            results,
            finished_at: new Date().toISOString(),
          })
          .eq('id', execution.id)
      }

      return new Response(JSON.stringify({
        success: true,
        execution_id: execution?.id,
        mode: team.mode,
        results,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })

    } catch (execError: unknown) {
      const errorMessage = execError instanceof Error ? execError.message : 'Unknown error'
      
      // 更新执行记录为失败
      if (execution) {
        await supabase
          .from('team_executions')
          .update({
            status: 'failed',
            error_message: errorMessage,
            finished_at: new Date().toISOString(),
          })
          .eq('id', execution.id)
      }

      return new Response(JSON.stringify({ error: errorMessage }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

function buildSystemPrompt(profile: any, member: any): string {
  const parts = []

  if (profile?.identity) parts.push(`# 角色\n${profile.identity}`)
  if (profile?.principles) parts.push(`# 原则\n${profile.principles}`)
  if (profile?.tone) parts.push(`# 语气\n${profile.tone}`)
  if (member?.responsibilities?.length) {
    parts.push(`# 职责\n${member.responsibilities.join('\n')}`)
  }

  return parts.join('\n\n')
}
