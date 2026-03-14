/**
 * Chat Store - Zustand 状态管理
 */

import { create } from 'zustand'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt: string
  toolCalls?: Array<{
    id: string
    name: string
    input: Record<string, unknown>
    status: 'pending' | 'executing' | 'completed' | 'error'
    result?: string
  }>
}

interface ChatStore {
  // State
  messages: ChatMessage[]
  isLoading: boolean
  isStreaming: boolean
  error: string | null

  // Actions
  addMessage: (message: ChatMessage) => void
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void
  addToolCall: (messageId: string, toolCall: ChatMessage['toolCalls'][0]) => void
  updateToolCall: (messageId: string, toolCallId: string, updates: Partial<ChatMessage['toolCalls'][0]>) => void
  setLoading: (loading: boolean) => void
  setStreaming: (streaming: boolean) => void
  setError: (error: string | null) => void
  clearMessages: () => void
}

export const useChatStore = create<ChatStore>((set) => ({
  // Initial state
  messages: [],
  isLoading: false,
  isStreaming: false,
  error: null,

  // Actions
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  updateMessage: (id, updates) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, ...updates } : msg
      ),
    })),

  addToolCall: (messageId, toolCall) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId
          ? { ...msg, toolCalls: [...(msg.toolCalls || []), toolCall] }
          : msg
      ),
    })),

  updateToolCall: (messageId, toolCallId, updates) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              toolCalls: msg.toolCalls?.map((tc) =>
                tc.id === toolCallId ? { ...tc, ...updates } : tc
              ),
            }
          : msg
      ),
    })),

  setLoading: (loading) => set({ isLoading: loading }),
  setStreaming: (streaming) => set({ isStreaming: streaming }),
  setError: (error) => set({ error }),
  clearMessages: () => set({ messages: [], error: null }),
}))
