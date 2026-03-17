/**
 * Teams CRUD Edge Function
 * 团队管理 API
 */

import { createClient } from "npm:@supabase/supabase-js@2"

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const method = req.method
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    const action = url.searchParams.get('action')

    // 获取用户 ID (简化版本，跳过严格认证)
    const authHeader = req.headers.get('Authorization')
    const userId = authHeader ? 'demo-user' : 'demo-user'

    // GET /teams - 获取列表
    if (method === 'GET' && !id) {
      const { data: teams, error } = await supabase
        .from('teams')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      // 获取每个团队的成员数量
      const teamsWithCount = await Promise.all(
        (teams || []).map(async (team) => {
          const { count } = await supabase
            .from('team_members')
            .select('*', { count: 'exact', head: true })
            .eq('team_id', team.id)
          
          return { ...team, memberCount: count || 0 }
        })
      )

      return new Response(JSON.stringify({ teams: teamsWithCount }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // GET /teams?id=xxx - 获取单个团队详情
    if (method === 'GET' && id) {
      // 获取团队信息
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('id', id)
        .single()

      if (teamError) throw teamError

      // 获取团队成员
      const { data: members, error: membersError } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', id)
        .order('order_index', { ascending: true })

      if (membersError) throw membersError

      // 获取每个成员对应的 Agent 信息
      const memberIds = members?.map(m => m.agent_id) || []
      const { data: agents } = await supabase
        .from('agents')
        .select('id, name, avatar_url, description')
        .in('id', memberIds)

      const agentMap = new Map(agents?.map(a => [a.id, a]) || [])

      const membersWithAgents = members?.map(m => ({
        ...m,
        agent: agentMap.get(m.agent_id) || null
      })) || []

      return new Response(JSON.stringify({ 
        team, 
        members: membersWithAgents 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // POST /teams - 创建团队
    if (method === 'POST') {
      const body = await req.json()
      const { name, description, mode, shared_context } = body

      const { data: team, error } = await supabase
        .from('teams')
        .insert({
          name,
          description,
          mode: mode || 'sequential',
          shared_context: shared_context || {},
        })
        .select()
        .single()

      if (error) throw error

      return new Response(JSON.stringify({ team }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // PUT /teams?id=xxx - 更新团队
    if (method === 'PUT' && id) {
      const body = await req.json()
      const { name, description, mode, shared_context, is_active } = body

      const { data: team, error } = await supabase
        .from('teams')
        .update({
          name,
          description,
          mode,
          shared_context,
          is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return new Response(JSON.stringify({ team }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // DELETE /teams?id=xxx - 删除团队
    if (method === 'DELETE' && id) {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', id)

      if (error) throw error

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // POST /teams/members - 添加成员
    if (method === 'POST' && action === 'add_member') {
      const body = await req.json()
      const { team_id, agent_id, role, responsibilities, order_index } = body

      const { data: member, error } = await supabase
        .from('team_members')
        .insert({
          team_id,
          agent_id,
          role: role || 'worker',
          responsibilities: responsibilities || [],
          order_index: order_index || 0,
        })
        .select()
        .single()

      if (error) throw error

      return new Response(JSON.stringify({ member }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // DELETE /teams/members?id=xxx - 移除成员
    if (method === 'DELETE' && action === 'remove_member') {
      const memberId = url.searchParams.get('member_id')

      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId)

      if (error) throw error

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
