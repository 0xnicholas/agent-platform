/**
 * 测试环境配置
 */

import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Supabase
vi.mock('../lib/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: null }
      }),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: {}, error: null }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: {}, error: null }),
            }),
          }),
        }),
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      }),
      functions: {
        invoke: vi.fn().mockResolvedValue({ data: {}, error: null }),
      },
    }),
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ data: {}, error: null }),
        remove: vi.fn().mockResolvedValue({ error: null }),
      }),
    },
  },
}))

// Mock React Router
vi.mock('react-router-dom', () => ({
  useParams: vi.fn().mockReturnValue({ id: 'test-agent-id' }),
  useNavigate: vi.fn().mockReturnValue(vi.fn()),
  useLocation: vi.fn().mockReturnValue({ pathname: '/agents/test-id' }),
  Link: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock window.location
Object.defineProperty(window, 'location', {
  value: { href: '', pathname: '/' },
  writable: true,
})
