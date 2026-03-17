/**
 * Teams Supabase API
 * 多 Agent 协作团队管理
 */

import { supabase } from './client'

export type OrchestrationMode = 'sequential' | 'parallel' | 'hierarchical' | 'router' | 'ensemble'
export type TeamMemberRole = 'coordinator' | 'worker' | 'specialist'

export interface Team {
  id: string
  workspace_id?: string
  name: string
  description?: string
  mode: OrchestrationMode
  shared_context: Record<string, unknown>
  is_active: boolean
  memberCount?: number
  created_at: string
  updated_at: string
}

export interface TeamMember {
  id: string
  team_id: string
  agent_id: string
  role: TeamMemberRole
  responsibilities: string[]
  input_schema: Record<string, unknown>
  output_schema: Record<string, unknown>
  order_index: number
  created_at: string
  agent?: {
    id: string
    name: string
    avatar_url?: string
    description?: string
  }
}

export interface TeamExecution {
  id: string
  team_id: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  input_task?: string
  results?: Record<string, unknown>
  started_at: string
  finished_at?: string
  error_message?: string
}

export interface TeamWithMembers extends Team {
  members: TeamMember[]
}

// ============ Team CRUD ============

/**
 * 获取团队列表
 */
export async function getTeams(): Promise<Team[]> {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw error

  // 获取每个团队的成员数量
  const teamsWithCount = await Promise.all(
    (data || []).map(async (team) => {
      const { count } = await supabase
        .from('team_members')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', team.id)

      return { ...team, memberCount: count || 0 }
    })
  )

  return teamsWithCount
}

/**
 * 获取团队详情（含成员）
 */
export async function getTeam(teamId: string): Promise<TeamWithMembers> {
  // 获取团队信息
  const { data: team, error: teamError } = await supabase
    .from('teams')
    .select('*')
    .eq('id', teamId)
    .single()

  if (teamError) throw teamError

  // 获取团队成员
  const { data: members, error: membersError } = await supabase
    .from('team_members')
    .select('*')
    .eq('team_id', teamId)
    .order('order_index', { ascending: true })

  if (membersError) throw membersError

  // 获取每个成员对应的 Agent 信息
  const memberIds = members?.map(m => m.agent_id) || []
  const { data: agents } = await supabase
    .from('agents')
    .select('id, name, avatar_url, description')
    .in('id', memberIds)

  const agentMap = new Map(agents?.map(a => [a.id, a]) || [])

  const membersWithAgents = members?.map(m => ({
    ...m,
    agent: agentMap.get(m.agent_id) || null
  })) || []

  return { ...team, members: membersWithAgents }
}

/**
 * 创建团队
 */
export async function createTeam(team: Partial<Team>): Promise<Team> {
  const { data, error } = await supabase
    .from('teams')
    .insert({
      name: team.name,
      description: team.description,
      mode: team.mode || 'sequential',
      shared_context: team.shared_context || {},
      is_active: true,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * 更新团队
 */
export async function updateTeam(teamId: string, updates: Partial<Team>): Promise<Team> {
  const { data, error } = await supabase
    .from('teams')
    .update({
      name: updates.name,
      description: updates.description,
      mode: updates.mode,
      shared_context: updates.shared_context,
      is_active: updates.is_active,
      updated_at: new Date().toISOString(),
    })
    .eq('id', teamId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * 删除团队
 */
export async function deleteTeam(teamId: string): Promise<void> {
  const { error } = await supabase
    .from('teams')
    .delete()
    .eq('id', teamId)

  if (error) throw error
}

// ============ Team Members ============

/**
 * 添加团队成员
 */
export async function addTeamMember(member: Partial<TeamMember>): Promise<TeamMember> {
  const { data, error } = await supabase
    .from('team_members')
    .insert({
      team_id: member.team_id,
      agent_id: member.agent_id,
      role: member.role || 'worker',
      responsibilities: member.responsibilities || [],
      input_schema: member.input_schema || {},
      output_schema: member.output_schema || {},
      order_index: member.order_index || 0,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * 移除团队成员
 */
export async function removeTeamMember(memberId: string): Promise<void> {
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('id', memberId)

  if (error) throw error
}

/**
 * 更新团队成员
 */
export async function updateTeamMember(memberId: string, updates: Partial<TeamMember>): Promise<TeamMember> {
  const { data, error } = await supabase
    .from('team_members')
    .update({
      role: updates.role,
      responsibilities: updates.responsibilities,
      input_schema: updates.input_schema,
      output_schema: updates.output_schema,
      order_index: updates.order_index,
    })
    .eq('id', memberId)
    .select()
    .single()

  if (error) throw error
  return data
}

// ============ Team Execution ============

/**
 * 执行团队任务
 */
export async function executeTeam(teamId: string, task: string): Promise<{
  success: boolean
  execution_id: string
  mode: string
  results: Record<string, unknown>
}> {
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/team-exec`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
      },
      body: JSON.stringify({ team_id: teamId, task }),
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Execution failed')
  }

  return response.json()
}

/**
 * 获取团队执行历史
 */
export async function getTeamExecutions(teamId: string): Promise<TeamExecution[]> {
  const { data, error } = await supabase
    .from('team_executions')
    .select('*')
    .eq('team_id', teamId)
    .order('started_at', { ascending: false })
    .limit(20)

  if (error) throw error
  return data || []
}

/**
 * 获取单个执行记录
 */
export async function getTeamExecution(executionId: string): Promise<TeamExecution> {
  const { data, error } = await supabase
    .from('team_executions')
    .select('*')
    .eq('id', executionId)
    .single()

  if (error) throw error
  return data
}
