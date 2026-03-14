/**
 * KnowledgeFiles API 测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { 
  getKnowledgeFiles, 
  uploadKnowledgeFile, 
  deleteKnowledgeFile, 
  retryEmbeddings 
} from '../../lib/supabase/knowledgeFiles'
import { supabase } from '../../lib/supabase/client'

const mockFile = {
  id: 'file-1',
  agent_id: 'agent-1',
  name: 'test.pdf',
  storage_path: 'knowledge/agent-1/test.pdf',
  mime_type: 'application/pdf',
  chunk_count: 10,
  embedding_status: 'completed',
  created_at: '2024-01-01T00:00:00Z',
}

describe('knowledgeFiles API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getKnowledgeFiles', () => {
    it('returns list of files', async () => {
      const mockResponse = { data: [mockFile], error: null }
      supabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue(mockResponse),
        }),
      })

      const result = await getKnowledgeFiles()
      
      expect(result).toEqual([mockFile])
    })

    // Note: Testing with agentId filter requires more complex mock setup
  })

  describe('uploadKnowledgeFile', () => {
    it('uploads file and creates record', async () => {
      const mockFileObj = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
      
      // Mock storage upload
      supabase.storage = {
        from: vi.fn().mockReturnValue({
          upload: vi.fn().mockResolvedValue({ data: { path: 'path/to/file' }, error: null }),
        }),
      }

      // Mock database insert
      const mockInsertResponse = { data: mockFile, error: null }
      supabase.from = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockInsertResponse),
          }),
        }),
      })

      // Mock function invoke
      supabase.functions = {
        invoke: vi.fn().mockResolvedValue({ data: {}, error: null }),
      }

      const result = await uploadKnowledgeFile('agent-1', mockFileObj)
      
      expect(result).toEqual(mockFile)
      expect(supabase.storage.from).toHaveBeenCalledWith('knowledge')
    })

    it('throws error on upload failure', async () => {
      const mockFileObj = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
      
      supabase.storage = {
        from: vi.fn().mockReturnValue({
          upload: vi.fn().mockResolvedValue({ data: null, error: new Error('Upload failed') }),
        }),
      }

      await expect(uploadKnowledgeFile('agent-1', mockFileObj)).rejects.toThrow('Upload failed')
    })
  })

  describe('deleteKnowledgeFile', () => {
    it('deletes file and storage', async () => {
      // Mock get file info
      const mockSelectResponse = { 
        data: { storage_path: 'knowledge/agent-1/test.pdf' }, 
        error: null 
      }
      
      // Create a mock that can handle both select and delete
      const mockFrom = vi.fn()
      mockFrom.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockSelectResponse),
          }),
        }),
      }).mockReturnValueOnce({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      })
      
      supabase.from = mockFrom

      // Mock storage remove
      supabase.storage = {
        from: vi.fn().mockReturnValue({
          remove: vi.fn().mockResolvedValue({ error: null }),
        }),
      }

      await expect(deleteKnowledgeFile('file-1')).resolves.not.toThrow()
    })
  })

  describe('retryEmbeddings', () => {
    it('triggers rag-ingest function', async () => {
      supabase.functions = {
        invoke: vi.fn().mockResolvedValue({ data: {}, error: null }),
      }

      await retryEmbeddings('file-1')
      
      expect(supabase.functions.invoke).toHaveBeenCalledWith('rag-ingest', {
        body: { file_id: 'file-1' },
      })
    })
  })
})
