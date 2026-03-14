/**
 * Tasks Supabase API
 */

import { supabase } from './client'

export interface Task {
  id: string
  agent_id: string
  name: string
  description?: string
  trigger: {
    type: 'cron' | 'event'
    expression?: string
    timezone?: string
  }
  prompt: string
  is_active: boolean
  last_run_at?: string
  last_run_status?: 'success' | 'failed' | 'partial'
  last_run_summary?: any
  created_at: string
  updated_at: string
}

export interface TaskRun {
  id: string
  task_id: string
  status: 'pending' | 'running' | 'success' | 'failed'
  summary?: any
  raw_conversation?: any
  started_at: string
  ended_at?: string
  error_message?: string
}

export async function getTasks(agentId?: string): Promise<Task[]> {
  let query = supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false })

  if (agentId) {
    query = query.eq('agent_id', agentId)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function getTask(taskId: string): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .single()

  if (error) throw error
  return data
}

export async function createTask(
  task: {
    agent_id: string
    name: string
    description?: string
    trigger?: { type: string; expression?: string; timezone?: string }
    prompt: string
  }
): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      agent_id: task.agent_id,
      name: task.name,
      description: task.description,
      trigger: task.trigger || { type: 'cron', expression: '0 8 * * *', timezone: 'Asia/Shanghai' },
      prompt: task.prompt,
      is_active: true,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateTask(
  taskId: string,
  updates: {
    name?: string
    description?: string
    trigger?: { type: string; expression?: string; timezone?: string }
    prompt?: string
    is_active?: boolean
  }
): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', taskId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteTask(taskId: string): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)

  if (error) throw error
}

export async function runTask(taskId: string): Promise<TaskRun> {
  // 触发任务执行（调用 Edge Function）
  const { data, error } = await supabase.functions.invoke('task-run', {
    body: { task_id: taskId },
  })

  if (error) throw error
  return data
}

export async function getTaskRuns(taskId: string): Promise<TaskRun[]> {
  const { data, error } = await supabase
    .from('task_runs')
    .select('*')
    .eq('task_id', taskId)
    .order('started_at', { ascending: false })
    .limit(50)

  if (error) throw error
  return data || []
}
