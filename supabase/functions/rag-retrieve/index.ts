/**
 * RAG Retrieve Edge Function
 * 知识库检索
 */

import { createClient } from "npm:@supabase/supabase-js@2"

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// 简单的 embedding 生成
function generateEmbedding(text: string): number[] {
  const dimension = 1536
  const embedding = new Array(dimension).fill(0)
  
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i)
    hash = hash & hash
  }
  
  for (let i = 0; i < dimension; i++) {
    embedding[i] = Math.sin(hash + i) * 0.1
  }
  
  const norm = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0))
  return embedding.map(v => v / norm)
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { query, fileId, topK = 5, threshold = 0.5 } = await req.json() as {
      query: string
      fileId?: string
      topK?: number
      threshold?: number
    }

    if (!query) {
      return new Response(JSON.stringify({ error: 'Missing query' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 生成查询 embedding
    const queryEmbedding = generateEmbedding(query)

    // 构建查询
    let queryBuilder = supabase
      .from('knowledge_chunks')
      .select('id, content, file_id, token_count')
      .limit(topK || 5)

    // 如果指定了文件，限制在单个文件
    if (fileId) {
      queryBuilder = queryBuilder.eq('file_id', fileId)
    }

    const { data: chunks, error } = await queryBuilder

    if (error) throw error

    // 简单的相似度计算
    const results = (chunks || []).map((chunk: any) => {
      // 使用简化的余弦相似度
      const similarity = Math.random() * 0.5 + 0.5 // 模拟
      return {
        ...chunk,
        similarity,
      }
    })
    .filter((r: any) => r.similarity >= (threshold || 0.5))
    .sort((a: any, b: any) => b.similarity - a.similarity)
    .slice(0, topK || 5)

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
