/**
 * Agent CRUD Edge Function
 * 简化版本 - 跳过认证用于测试
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

    // GET - 获取列表或单个
    if (method === 'GET') {
      const url = new URL(req.url)
      const id = url.searchParams.get('id')
      
      if (id) {
        // 获取单个
        const { data: agent, error } = await supabase
          .from('agents')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error

        return new Response(JSON.stringify({ agent }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      
      // 获取列表
      const { data: agents, error } = await supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      return new Response(JSON.stringify({ agents: agents || [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // POST - 创建
    if (method === 'POST') {
      const body = await req.json()
      
      const { data: agent, error } = await supabase
        .from('agents')
        .insert({
          name: body.name,
          description: body.description || '',
          profile: body.profile || {},
          model_config: body.model_config || { model: 'kimi-turbo' },
          is_published: false,
          total_conversations: 0,
          total_tasks_run: 0,
        })
        .select()
        .single()

      if (error) throw error

      return new Response(JSON.stringify({ agent }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // PUT - 更新
    if (method === 'PUT') {
      const { id, ...updates } = await req.json()

      const { data: agent, error } = await supabase
        .from('agents')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return new Response(JSON.stringify({ agent }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // DELETE - 删除
    if (method === 'DELETE') {
      const { id } = await req.json()

      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', id)

      if (error) throw error

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
