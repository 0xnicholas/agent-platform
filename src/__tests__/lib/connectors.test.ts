/**
 * Connectors API 测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { 
  getConnectors, 
  createConnector, 
  updateConnector, 
  deleteConnector, 
  toggleConnector,
  connectorTypes 
} from '../../lib/supabase/connectors'
import { supabase } from '../../lib/supabase/client'

const mockConnector = {
  id: 'connector-1',
  agent_id: 'agent-1',
  type: 'feishu',
  name: 'Feishu Bot',
  credentials_ref: 'feishu-creds',
  tools: ['send_message'],
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

describe('connectors API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getConnectors', () => {
    it('returns list of connectors for an agent', async () => {
      const mockResponse = { data: [mockConnector], error: null }
      supabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue(mockResponse),
          }),
        }),
      })

      const result = await getConnectors('agent-1')
      
      expect(result).toEqual([mockConnector])
      expect(supabase.from).toHaveBeenCalledWith('connectors')
    })
  })

  describe('createConnector', () => {
    it('creates a new connector', async () => {
      const newConnector = { 
        type: 'feishu', 
        name: 'New Connector',
        credentials_ref: 'creds-123'
      }
      const mockResponse = { data: mockConnector, error: null }
      
      supabase.from = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockResponse),
          }),
        }),
      })

      const result = await createConnector('agent-1', newConnector)
      
      expect(result).toEqual(mockConnector)
    })
  })

  describe('updateConnector', () => {
    it('updates an existing connector', async () => {
      const updates = { name: 'Updated Name', is_active: false }
      const mockResponse = { data: { ...mockConnector, ...updates }, error: null }
      
      supabase.from = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue(mockResponse),
            }),
          }),
        }),
      })

      const result = await updateConnector('connector-1', updates)
      
      expect(result.name).toBe('Updated Name')
    })
  })

  describe('deleteConnector', () => {
    it('deletes a connector', async () => {
      const mockResponse = { error: null }
      
      supabase.from = vi.fn().mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue(mockResponse),
        }),
      })

      await expect(deleteConnector('connector-1')).resolves.not.toThrow()
    })
  })

  describe('toggleConnector', () => {
    it('toggles connector active state', async () => {
      const mockResponse = { 
        data: { ...mockConnector, is_active: false }, 
        error: null 
      }
      
      supabase.from = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue(mockResponse),
            }),
          }),
        }),
      })

      const result = await toggleConnector('connector-1', false)
      
      expect(result.is_active).toBe(false)
    })
  })

  describe('connectorTypes', () => {
    it('contains feishu connector type', () => {
      const feishu = connectorTypes.find(c => c.type === 'feishu')
      expect(feishu).toBeDefined()
      expect(feishu?.name).toBe('飞书')
    })

    it('contains slack connector type', () => {
      const slack = connectorTypes.find(c => c.type === 'slack')
      expect(slack).toBeDefined()
      expect(slack?.name).toBe('Slack')
    })

    it('contains github connector type', () => {
      const github = connectorTypes.find(c => c.type === 'github')
      expect(github).toBeDefined()
      expect(github?.name).toBe('GitHub')
    })
  })
})
