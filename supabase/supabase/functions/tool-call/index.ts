/**
 * Tool Call Edge Function
 * 处理 Agent 的 Tool Calling 请求
 */

import { createClient } from "npm:@supabase/supabase-js@2"

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface RequestBody {
  agentId: string
  toolName: string
  toolArgs: Record<string, unknown>
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { agentId, toolName, toolArgs } = await req.json() as RequestBody

    // 验证用户
    const authHeader = req.headers.get('Authorization')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 获取 Agent 的 Connectors
    const { data: connectors } = await supabase
      .from('connectors')
      .select('*')
      .eq('agent_id', agentId)
      .eq('is_active', true)

    // 查找对应的 Connector
    const connector = connectors?.find((c) => {
      const tools = c.tools as Array<{ name: string }>
      return tools?.some((t) => t.name === toolName)
    })

    if (!connector) {
      return new Response(JSON.stringify({ 
        error: 'Tool not found',
        toolName 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 从 Vault 获取凭证
    const { data: credentials } = await supabase.rpc(
      'get_connector_credentials',
      { connector_ref: connector.credentials_ref }
    )

    // 执行 Tool（根据 connector.type 调用不同的 API）
    const result = await executeTool(connector.type, toolName, toolArgs, credentials)

    return new Response(JSON.stringify({ result }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})

async function executeTool(
  type: string,
  toolName: string,
  toolArgs: Record<string, unknown>,
  credentials: Record<string, string>
): Promise<unknown> {
  // TODO: 根据 connector.type 实现具体的 tool 执行逻辑
  // 这里先返回 mock 数据
  console.log('Executing tool:', type, toolName, toolArgs)
  
  return {
    success: true,
    message: `Tool ${toolName} executed (mock)`,
  }
}
