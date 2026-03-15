/**
 * App 路由配置
 */

import { BrowserRouter, Routes, Route, Navigate, useParams, Outlet } from 'react-router-dom'
import { Layout } from './components/layout'
import { HomeLayout } from './components/layout/HomeLayout'
import { HomePage } from './components/home/HomePage'
import { AgentListPage } from './components/agent/list'
import { AgentCreatePage } from './components/agent/detail/AgentCreatePage'
import { AgentChatPage } from './components/agent/detail/AgentChatPage'
import { MemoryPage } from './components/agent/memory/MemoryPage'
import { IntegrationsPage } from './components/agent/integrations/IntegrationsPage'
import { AgentSettingsPage } from './components/agent/settings/AgentSettingsPage'
import { ChatListPage } from './components/chat/ChatListPage'
import { TasksPage } from './components/tasks/TasksPage'
import { FilesPage } from './components/files/FilesPage'
import { ProfilePage } from './components/settings/ProfilePage'
import { SkillsPage } from './components/agent/skills/SkillsPage'
import { SettingsPage } from './components/settings/SettingsPage'
import { MarketplacePage } from './components/marketplace/MarketplacePage'
import { PricingPage } from './components/settings/PricingPage'
import { ConnectorManagePage } from './components/connector/ConnectorManagePage'
import { AuthPage } from './components/auth/AuthPage'
import { DebugPanel } from './components/debug/DebugPanel'
import { ToastContainer } from './components/ui/Toast'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase/client'
import { getAgent } from './lib/supabase/agents'

function AuthGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAuthenticated(!!user)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>
  }

  if (!isAuthenticated) {
    return <AuthPage />
  }

  return <>{children}</>
}

// Agent 详情页 Layout（包含 Sidebar）
function AgentLayout() {
  const { id } = useParams<{ id: string }>()
  const [agentName, setAgentName] = useState('')
  
  useEffect(() => {
    if (id) {
      getAgent(id).then(data => {
        setAgentName(data.name)
      }).catch(console.error)
    }
  }, [id])
  
  return (
    <Layout agentId={id} agentName={agentName}>
      <Outlet />
    </Layout>
  )
}

// 其他页面 Layout
function DefaultLayout() {
  return (
    <Layout agentId={undefined}>
      <Outlet />
    </Layout>
  )
}

function AppRoutes() {
  return (
    <Routes>
      {/* 首页 */}
      <Route element={<DefaultLayout />}>
        <Route path="/" element={<HomeLayout><HomePage /></HomeLayout>} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/auth" element={<Navigate to="/" replace />} />
        <Route path="/agents" element={<AgentListPage />} />
        <Route path="/agents/new" element={<AgentCreatePage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/knowledge" element={<FilesPage />} />
        <Route path="/memory" element={<FilesPage />} />
        <Route path="/integrations" element={<ConnectorManagePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/chat" element={<ChatListPage />} />
      </Route>

      {/* Agent 详情页 Layout */}
      <Route element={<AgentLayout />}>
        <Route path="/agents/:id" element={<Navigate to="chat" replace />} />
        <Route path="/agents/:id/chat" element={<AgentChatPage />} />
        <Route path="/agents/:id/memory" element={<MemoryPage />} />
        <Route path="/agents/:id/integrations" element={<IntegrationsPage />} />
        <Route path="/agents/:id/profile" element={<ProfilePage />} />
        <Route path="/agents/:id/skills" element={<SkillsPage />} />
        <Route path="/agents/:id/knowledge" element={<FilesPage />} />
        <Route path="/agents/:id/tasks" element={<TasksPage />} />
        <Route path="/agents/:id/settings" element={<AgentSettingsPage />} />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthGuard>
        <AppRoutes />
      </AuthGuard>
      <ToastContainer />
      <DebugPanel />
    </BrowserRouter>
  )
}

export default App
