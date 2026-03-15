/**
 * Task Scheduler Edge Function
 * 替代 pg_cron 的任务调度器
 * 可通过外部 cron 服务定期调用
 */

import { createClient } from "npm:@supabase/supabase-js@2"

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const url = new URL(req.url)
    const action = url.searchParams.get('action') || 'check'

    if (action === 'check') {
      // 检查需要执行的任务
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('is_active', true)
        .eq('trigger->>type', 'cron')

      if (error) throw error

      const dueTasks = (tasks || []).filter(task => {
        const cronExpr = task.trigger?.expression
        if (!cronExpr) return false
        
        // 简单的 cron 检查 - 如果 last_run_at 超过指定间隔
        const interval = parseCronInterval(cronExpr)
        if (!task.last_run_at) return true
        
        const lastRun = new Date(task.last_run_at)
        const now = new Date()
        const diffMs = now.getTime() - lastRun.getTime()
        
        return diffMs >= interval
      })

      return new Response(JSON.stringify({
        message: `Found ${dueTasks.length} tasks due`,
        tasks: dueTasks.map(t => ({
          id: t.id,
          name: t.name,
          agent_id: t.agent_id,
          expression: t.trigger?.expression,
          last_run_at: t.last_run_at,
        })),
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'run') {
      // 执行指定的任务
      const task_id = url.searchParams.get('task_id')
      if (!task_id) {
        return new Response(JSON.stringify({ error: 'task_id required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // 调用 task-run function
      const taskRunUrl = `${supabaseUrl}/functions/v1/task-run`
      const response = await fetch(taskRunUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({ task_id }),
      })

      const result = await response.json()

      return new Response(JSON.stringify({
        message: 'Task executed',
        task_id,
        result,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'run-all') {
      // 执行所有到期的任务
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('is_active', true)
        .eq('trigger->>type', 'cron')

      if (error) throw error

      const results = []
      for (const task of (tasks || [])) {
        try {
          const taskRunUrl = `${supabaseUrl}/functions/v1/task-run`
          const response = await fetch(taskRunUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({ task_id: task.id }),
          })

          const result = await response.json()
          results.push({ task_id: task.id, status: 'success', result })
        } catch (err) {
          results.push({ task_id: task.id, status: 'error', error: String(err) })
        }
      }

      return new Response(JSON.stringify({
        message: `Executed ${results.length} tasks`,
        results,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ 
      error: 'Invalid action. Use: check, run, or run-all' 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

/**
 * 解析 cron 表达式间隔（毫秒）
 * 支持: every_minute, every_5_minutes, hourly, daily, weekly
 */
function parseCronInterval(cronExpr: string): number {
  const intervals: Record<string, number> = {
    '* * * * *': 60 * 1000,           // 每分钟
    '*/5 * * * *': 5 * 60 * 1000,     // 每5分钟
    '*/15 * * * *': 15 * 60 * 1000,   // 每15分钟
    '*/30 * * * *': 30 * 60 * 1000,   // 每30分钟
    '0 * * * *': 60 * 60 * 1000,      // 每小时
    '0 0 * * *': 24 * 60 * 60 * 1000, // 每天
    '0 0 * * 0': 7 * 24 * 60 * 60 * 1000, // 每周
  }

  return intervals[cronExpr] || 60 * 60 * 1000 // 默认1小时
}
