/**
 * Agent Team 编排类型定义
 */

export type OrchestrationMode = 'sequential' | 'parallel' | 'hierarchical' | 'router' | 'ensemble'

export interface AgentTeam {
  id: string
  name: string
  description?: string
  mode: OrchestrationMode
  agents: TeamMember[]
  sharedContext: Record<string, unknown>
  created_at: string
}

export interface TeamMember {
  agentId: string
  role: 'coordinator' | 'worker' | 'specialist'
  responsibilities: string[]
  inputSchema?: Record<string, unknown>
  outputSchema?: Record<string, unknown>
}

export interface TeamExecution {
  id: string
  teamId: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  results: Record<string, unknown>
  startedAt: string
  finishedAt?: string
}
