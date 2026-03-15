/**
 * RAG Ingest Edge Function
 * 知识库文件摄入和向量化
 */

import { createClient } from "npm:@supabase/supabase-js@2"

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// 支持的文件类型
const SUPPORTED_TYPES = [
  'application/pdf',
  'text/plain',
  'text/markdown',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/csv',
]

// 简单的文本分块
function chunkText(text: string, chunkSize = 1000, overlap = 200): string[] {
  const chunks: string[] = []
  let start = 0

  while (start < text.length) {
    const end = start + chunkSize
    chunks.push(text.slice(start, end))
    start = end - overlap
  }

  return chunks
}

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

Deno.serve(async (req) => {
  // CORS preflight
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

    const { fileId, content } = await req.json() as { fileId: string; content: string }

    if (!fileId || !content) {
      return new Response(JSON.stringify({ error: 'Missing fileId or content' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 分块
    const chunks = chunkText(content)
    
    // 向量化并存储
    const knowledgeChunks = chunks.map((chunk) => ({
      file_id: fileId,
      content: chunk,
      embedding: generateEmbedding(chunk),
      token_count: Math.ceil(chunk.length / 4),
    }))

    // 批量插入
    const { data, error } = await supabase
      .from('knowledge_chunks')
      .insert(knowledgeChunks)

    if (error) throw error

    // 更新文件状态
    await supabase
      .from('knowledge_files')
      .update({
        chunk_count: chunks.length,
        embedding_status: 'completed',
      })
      .eq('id', fileId)

    return new Response(JSON.stringify({
      success: true,
      chunks: chunks.length,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
