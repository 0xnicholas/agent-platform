/**
 * useAgent Hook - Agent 数据管理
 */

import { useState, useEffect, useCallback } from 'react'
import { getAgents, getAgent, createAgent, updateAgent, deleteAgent } from '@/lib/supabase/agents'
import type { Agent } from '@/types/agent'

interface UseAgentOptions {
  autoFetch?: boolean
}

export function useAgent(id?: string, options: UseAgentOptions = {}) {
  const { autoFetch = false } = options

  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 获取所有 Agents
  const fetchAgents = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getAgents()
      setAgents(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch agents')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 获取单个 Agent
  const fetchAgent = useCallback(async (agentId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getAgent(agentId)
      setSelectedAgent(data)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch agent')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 创建 Agent
  const addAgent = useCallback(async (input: Parameters<typeof createAgent>[0]) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await createAgent(input)
      setAgents((prev) => [data, ...prev])
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create agent')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 更新 Agent
  const editAgent = useCallback(async (agentId: string, updates: Parameters<typeof updateAgent>[1]) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await updateAgent(agentId, updates)
      setAgents((prev) => prev.map((a) => (a.id === agentId ? data : a)))
      if (selectedAgent?.id === agentId) {
        setSelectedAgent(data)
      }
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update agent')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [selectedAgent])

  // 删除 Agent
  const removeAgent = useCallback(async (agentId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      await deleteAgent(agentId)
      setAgents((prev) => prev.filter((a) => a.id !== agentId))
      if (selectedAgent?.id === agentId) {
        setSelectedAgent(null)
      }
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete agent')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [selectedAgent])

  // 自动获取
  useEffect(() => {
    if (autoFetch) {
      fetchAgents()
    }
  }, [autoFetch, fetchAgents])

  // 获取单个 Agent
  useEffect(() => {
    if (id && autoFetch) {
      fetchAgent(id)
    }
  }, [id, autoFetch, fetchAgent])

  return {
    agents,
    selectedAgent,
    isLoading,
    error,
    fetchAgents,
    fetchAgent,
    addAgent,
    editAgent,
    removeAgent,
  }
}
