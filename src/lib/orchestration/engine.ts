/**
 * Agent 编排引擎
 * 多 Agent 协作执行
 */

import { callLLM } from '../llm'
import type { Message } from '../llm/types'
import type { AgentTeam, TeamMember } from '@/types/orchestration'

/**
 * 编排引擎主类
 */
export class OrchestrationEngine {
  private team: AgentTeam
  private context: Record<string, unknown> = {}

  constructor(team: AgentTeam) {
    this.team = team
    this.context = team.sharedContext || {}
  }

  /**
   * 执行团队任务
   */
  async execute(task: string, agents: Map<string, {
    profile: { identity: string; principles: string }
    model_config: { model: string }
  }>): Promise<Record<string, unknown>> {
    const mode = this.team.mode

    switch (mode) {
      case 'sequential':
        return this.executeSequential(task, agents)
      case 'parallel':
        return this.executeParallel(task, agents)
      case 'hierarchical':
        return this.executeHierarchical(task, agents)
      case 'router':
        return this.executeRouter(task, agents)
      case 'ensemble':
        return this.executeEnsemble(task, agents)
      default:
        throw new Error(`Unknown mode: ${mode}`)
    }
  }

  /**
   * 串行执行 - 一个接一个
   */
  private async executeSequential(
    task: string,
    agents: Map<string, any>
  ): Promise<Record<string, unknown>> {
    const results: Record<string, unknown> = {}
    let currentTask = task

    for (const member of this.team.agents) {
      const agent = agents.get(member.agentId)
      if (!agent) continue

      const response = await this.executeAgent(
        member,
        currentTask,
        agent,
        results
      )

      results[member.agentId] = response
      currentTask = ` Previous results: ${JSON.stringify(response)} `
    }

    return results
  }

  /**
   * 并行执行 - 同时运行
   */
  private async executeParallel(
    task: string,
    agents: Map<string, any>
  ): Promise<Record<string, unknown>> {
    const promises = this.team.agents.map(async (member) => {
      const agent = agents.get(member.agentId)
      if (!agent) return null

      return {
        agentId: member.agentId,
        result: await this.executeAgent(member, task, agent, {}),
      }
    })

    const results = await Promise.all(promises)
    
    return results.reduce((acc, r) => {
      if (r) acc[r.agentId] = r.result
      return acc
    }, {} as Record<string, unknown>)
  }

  /**
   * 层级执行 - 协调者分配任务
   */
  private async executeHierarchical(
    task: string,
    agents: Map<string, any>
  ): Promise<Record<string, unknown>> {
    const coordinator = this.team.agents.find(a => a.role === 'coordinator')
    const workers = this.team.agents.filter(a => a.role === 'worker' || a.role === 'specialist')

    if (!coordinator) {
      return this.executeSequential(task, agents)
    }

    // 协调者分析任务并分配
    const coordinatorAgent = agents.get(coordinator.agentId)
    if (!coordinatorAgent) {
      throw new Error('Coordinator not found')
    }

    const allocation = await this.executeAgent(
      coordinator,
      `分析并分配这个任务: ${task}. 列出每个 worker 应该做什么。`,
      coordinatorAgent,
      {}
    )

    // 收集所有 worker 的结果
    const workerPromises = workers.map(async (worker) => {
      const workerAgent = agents.get(worker.agentId)
      if (!workerAgent) return null

      return {
        agentId: worker.agentId,
        result: await this.executeAgent(worker, task, workerAgent, {}),
      }
    })

    const workerResults = await Promise.all(workerPromises)

    return {
      allocation,
      workers: workerResults.reduce((acc, r) => {
        if (r) acc[r.agentId] = r.result
        return acc
      }, {} as Record<string, unknown>)
    }
  }

  /**
   * 路由执行 - 根据任务类型分发
   */
  private async executeRouter(
    task: string,
    agents: Map<string, any>
  ): Promise<Record<string, unknown>> {
    // 使用 router 角色的 agent 决定分发给谁
    const router = this.team.agents.find(a => a.role === 'coordinator')
    const routerAgent = router ? agents.get(router.agentId) : null

    if (!routerAgent) {
      // 没有 router，默认串行
      return this.executeSequential(task, agents)
    }

    // Router 分析任务
    const routing = await this.executeAgent(
      router,
      `分析这个任务: "${task}". 选择最合适的 agent。返回 agent ID。`,
      routerAgent,
      {}
    )

    // 执行选中的 agent
    const targetAgent = agents.get((routing as any).selectedAgentId)
    if (!targetAgent) {
      throw new Error(`Selected agent not found: ${(routing as any).selectedAgentId}`)
    }

    const member = this.team.agents.find(a => a.agentId === (routing as any).selectedAgentId)!
    return {
      routing,
      result: await this.executeAgent(member, task, targetAgent, {})
    }
  }

  /**
   * 集成执行 - 多个 agent 结果汇总
   */
  private async executeEnsemble(
    task: string,
    agents: Map<string, any>
  ): Promise<Record<string, unknown>> {
    // 所有 agent 都执行同一任务
    const promises = this.team.agents.map(async (member) => {
      const agent = agents.get(member.agentId)
      if (!agent) return null

      return {
        agentId: member.agentId,
        result: await this.executeAgent(member, task, agent, {}),
      }
    })

    const results = await Promise.all(promises)

    // 汇总结果
    const individualResults = results.reduce((acc, r) => {
      if (r) acc[r.agentId] = r.result
      return acc
    }, {} as Record<string, unknown>)

    // 使用最后一个 agent 作为汇总
    const summarizer = this.team.agents[this.team.agents.length - 1]
    const summarizerAgent = agents.get(summarizer.agentId)

    if (summarizerAgent) {
      const summary = await this.executeAgent(
        summarizer,
        `汇总以下结果: ${JSON.stringify(individualResults)}`,
        summarizerAgent,
        {}
      )
      return { summary, individualResults }
    }

    return { individualResults }
  }

  /**
   * 执行单个 Agent
   */
  private async executeAgent(
    member: TeamMember,
    task: string,
    agent: any,
    context: Record<string, unknown>
  ): Promise<unknown> {
    const systemPrompt = this.buildSystemPrompt(agent.profile, member)

    const messages: Message[] = [
      { role: 'user', content: task },
    ]

    const response = await callLLM({
      systemPrompt,
      messages,
      modelConfig: agent.model_config,
    })

    return response.content
  }

  /**
   * 构建 System Prompt
   */
  private buildSystemPrompt(profile: any, member: TeamMember): string {
    const parts = []

    if (profile?.identity) parts.push(`# 角色\n${profile.identity}`)
    if (profile?.principles) parts.push(`# 原则\n${profile.principles}`)
    if (member.responsibilities?.length) {
      parts.push(`# 职责\n${member.responsibilities.join('\n')}`)
    }

    parts.push(`# 上下文\n${JSON.stringify(this.context)}`)

    return parts.join('\n\n')
  }
}
