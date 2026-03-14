/**
 * Tasks API 测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { 
  getTasks, 
  getTask, 
  createTask, 
  updateTask, 
  deleteTask, 
  runTask,
  getTaskRuns 
} from '../../lib/supabase/tasks'
import { supabase } from '../../lib/supabase/client'

const mockTask = {
  id: 'task-1',
  agent_id: 'agent-1',
  name: 'Daily Report',
  description: 'Send daily report',
  trigger: { type: 'cron', expression: '0 8 * * *', timezone: 'Asia/Shanghai' },
  prompt: 'Generate daily report',
  is_active: true,
  last_run_at: '2024-01-01T00:00:00Z',
  last_run_status: 'success',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

const mockTaskRun = {
  id: 'run-1',
  task_id: 'task-1',
  status: 'success',
  summary: { message: 'Report sent' },
  started_at: '2024-01-01T08:00:00Z',
  ended_at: '2024-01-01T08:01:00Z',
}

describe('tasks API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getTasks', () => {
    it('returns list of tasks', async () => {
      const mockResponse = { data: [mockTask], error: null }
      
      supabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue(mockResponse),
        }),
      })

      const result = await getTasks()
      
      expect(result).toEqual([mockTask])
    })

    // Note: Testing with agentId filter requires more complex mock setup
    // due to the way the query is built before filtering
  })

  describe('getTask', () => {
    it('returns single task', async () => {
      const mockResponse = { data: mockTask, error: null }
      supabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockResponse),
          }),
        }),
      })

      const result = await getTask('task-1')
      
      expect(result).toEqual(mockTask)
    })
  })

  describe('createTask', () => {
    it('creates a new task', async () => {
      const newTask = { 
        agent_id: 'agent-1',
        name: 'New Task',
        prompt: 'Task prompt'
      }
      const mockResponse = { data: mockTask, error: null }
      
      supabase.from = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockResponse),
          }),
        }),
      })

      const result = await createTask(newTask)
      
      expect(result).toEqual(mockTask)
    })
  })

  describe('updateTask', () => {
    it('updates an existing task', async () => {
      const updates = { name: 'Updated Task', is_active: false }
      const mockResponse = { data: { ...mockTask, ...updates }, error: null }
      
      supabase.from = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue(mockResponse),
            }),
          }),
        }),
      })

      const result = await updateTask('task-1', updates)
      
      expect(result.name).toBe('Updated Task')
    })
  })

  describe('deleteTask', () => {
    it('deletes a task', async () => {
      const mockResponse = { error: null }
      
      supabase.from = vi.fn().mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue(mockResponse),
        }),
      })

      await expect(deleteTask('task-1')).resolves.not.toThrow()
    })
  })

  describe('runTask', () => {
    it('invokes task-run function', async () => {
      supabase.functions = {
        invoke: vi.fn().mockResolvedValue({ data: mockTaskRun, error: null }),
      }

      const result = await runTask('task-1')
      
      expect(supabase.functions.invoke).toHaveBeenCalledWith('task-run', {
        body: { task_id: 'task-1' },
      })
      expect(result).toEqual(mockTaskRun)
    })
  })

  describe('getTaskRuns', () => {
    it('returns task run history', async () => {
      const mockResponse = { data: [mockTaskRun], error: null }
      supabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue(mockResponse),
            }),
          }),
        }),
      })

      const result = await getTaskRuns('task-1')
      
      expect(result).toEqual([mockTaskRun])
    })
  })
})
