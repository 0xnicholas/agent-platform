/**
 * Agent Store - Zustand 状态管理
 */

import { create } from 'zustand'
import type { Agent } from '@/types/agent'

interface AgentStore {
  // State
  agents: Agent[]
  selectedAgent: Agent | null
  isLoading: boolean
  error: string | null

  // Actions
  setAgents: (agents: Agent[]) => void
  addAgent: (agent: Agent) => void
  updateAgent: (id: string, updates: Partial<Agent>) => void
  removeAgent: (id: string) => void
  selectAgent: (agent: Agent | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useAgentStore = create<AgentStore>((set) => ({
  // Initial state
  agents: [],
  selectedAgent: null,
  isLoading: false,
  error: null,

  // Actions
  setAgents: (agents) => set({ agents }),

  addAgent: (agent) =>
    set((state) => ({
      agents: [agent, ...state.agents],
    })),

  updateAgent: (id, updates) =>
    set((state) => ({
      agents: state.agents.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      ),
      selectedAgent:
        state.selectedAgent?.id === id
          ? { ...state.selectedAgent, ...updates }
          : state.selectedAgent,
    })),

  removeAgent: (id) =>
    set((state) => ({
      agents: state.agents.filter((a) => a.id !== id),
      selectedAgent:
        state.selectedAgent?.id === id ? null : state.selectedAgent,
    })),

  selectAgent: (agent) => set({ selectedAgent: agent }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),
}))
