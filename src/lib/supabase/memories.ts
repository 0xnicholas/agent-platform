/**
 * Memories Supabase API
 */

import { supabase } from './client'
import type { Agent } from '@types/agent'

export interface Memory {
  id: string
  agent_id: string
  user_id: string
  type: string
  content: string
  created_at: string
}

export async function getMemories(agentId: string): Promise<Memory[]> {
  const { data, error } = await supabase
    .from('memories')
    .select('*')
    .eq('agent_id', agentId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createMemory(
  agentId: string,
  memory: { type: string; content: string }
): Promise<Memory> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('memories')
    .insert({
      agent_id: agentId,
      user_id: user.id,
      type: memory.type,
      content: memory.content,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateMemory(
  memoryId: string,
  updates: { type?: string; content?: string }
): Promise<Memory> {
  const { data, error } = await supabase
    .from('memories')
    .update(updates)
    .eq('id', memoryId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteMemory(memoryId: string): Promise<void> {
  const { error } = await supabase
    .from('memories')
    .delete()
    .eq('id', memoryId)

  if (error) throw error
}
