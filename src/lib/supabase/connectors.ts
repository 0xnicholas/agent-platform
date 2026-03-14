/**
 * Connectors Supabase API
 */

import { supabase } from './client'

export interface Connector {
  id: string
  agent_id: string
  type: string
  name: string
  credentials_ref?: string
  tools: any[]
  is_active: boolean
  created_at: string
  updated_at: string
}

// 可用的 Connector 类型
export const connectorTypes = [
  {
    type: 'feishu',
    name: '飞书',
    icon: '🐜',
    description: '飞书消息、卡片、Bot',
    tools: ['send_message', 'send_card', 'create卡片', 'get_user'],
  },
  {
    type: 'slack',
    name: 'Slack',
    icon: '💬',
    description: 'Slack 消息、频道管理',
    tools: ['post_message', 'create_channel', 'list_channels'],
  },
  {
    type: 'github',
    name: 'GitHub',
    icon: '🐙',
    description: 'GitHub 仓库、Issue、PR',
    tools: ['create_issue', 'list_issues', 'create_pr', 'get_repo_info'],
  },
]

export async function getConnectors(agentId: string): Promise<Connector[]> {
  const { data, error } = await supabase
    .from('connectors')
    .select('*')
    .eq('agent_id', agentId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createConnector(
  agentId: string,
  connector: { type: string; name: string; credentials_ref?: string; tools?: any[] }
): Promise<Connector> {
  const { data, error } = await supabase
    .from('connectors')
    .insert({
      agent_id: agentId,
      type: connector.type,
      name: connector.name,
      credentials_ref: connector.credentials_ref,
      tools: connector.tools || [],
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateConnector(
  connectorId: string,
  updates: { name?: string; credentials_ref?: string; tools?: any[]; is_active?: boolean }
): Promise<Connector> {
  const { data, error } = await supabase
    .from('connectors')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', connectorId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteConnector(connectorId: string): Promise<void> {
  const { error } = await supabase
    .from('connectors')
    .delete()
    .eq('id', connectorId)

  if (error) throw error
}

export async function toggleConnector(connectorId: string, isActive: boolean): Promise<Connector> {
  return updateConnector(connectorId, { is_active: isActive })
}
