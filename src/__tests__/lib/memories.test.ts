/**
 * Memories API 测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getMemories, createMemory, updateMemory, deleteMemory } from '../../lib/supabase/memories'
import { supabase } from '../../lib/supabase/client'

// Mock 数据
const mockMemory = {
  id: 'memory-1',
  agent_id: 'agent-1',
  user_id: 'user-1',
  type: 'fact',
  content: 'Test memory',
  created_at: '2024-01-01T00:00:00Z',
}

describe('memories API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getMemories', () => {
    it('returns list of memories for an agent', async () => {
      const mockResponse = { data: [mockMemory], error: null }
      supabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue(mockResponse),
          }),
        }),
      })

      const result = await getMemories('agent-1')
      
      expect(result).toEqual([mockMemory])
      expect(supabase.from).toHaveBeenCalledWith('memories')
    })

    it('throws error on failure', async () => {
      const mockResponse = { data: null, error: new Error('Failed') }
      supabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue(mockResponse),
          }),
        }),
      })

      await expect(getMemories('agent-1')).rejects.toThrow()
    })
  })

  describe('createMemory', () => {
    it('creates a new memory', async () => {
      const newMemory = { type: 'fact', content: 'New memory' }
      const mockResponse = { data: mockMemory, error: null }
      
      supabase.auth.getUser = vi.fn().mockResolvedValue({
        data: { user: { id: 'user-1' } },
      })
      
      supabase.from = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockResponse),
          }),
        }),
      })

      const result = await createMemory('agent-1', newMemory)
      
      expect(result).toEqual(mockMemory)
    })

    it('throws error when not authenticated', async () => {
      supabase.auth.getUser = vi.fn().mockResolvedValue({
        data: { user: null },
      })

      await expect(
        createMemory('agent-1', { type: 'fact', content: 'Test' })
      ).rejects.toThrow('Not authenticated')
    })
  })

  describe('updateMemory', () => {
    it('updates an existing memory', async () => {
      const updates = { content: 'Updated content' }
      const mockResponse = { data: { ...mockMemory, ...updates }, error: null }
      
      supabase.from = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue(mockResponse),
            }),
          }),
        }),
      })

      const result = await updateMemory('memory-1', updates)
      
      expect(result.content).toBe('Updated content')
    })
  })

  describe('deleteMemory', () => {
    it('deletes a memory', async () => {
      const mockResponse = { error: null }
      
      supabase.from = vi.fn().mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue(mockResponse),
        }),
      })

      await expect(deleteMemory('memory-1')).resolves.not.toThrow()
    })
  })
})
