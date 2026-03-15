/**
 * Knowledge Files Supabase API
 */

import { supabase } from './client'

export interface KnowledgeFile {
  id: string
  agent_id: string
  name: string
  storage_path: string
  mime_type?: string
  chunk_count: number
  embedding_status: 'pending' | 'processing' | 'completed' | 'failed'
  created_at: string
}

export async function getKnowledgeFiles(agentId?: string): Promise<KnowledgeFile[]> {
  let query = supabase
    .from('knowledge_files')
    .select('*')
    .order('created_at', { ascending: false })

  if (agentId) {
    query = query.eq('agent_id', agentId)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function uploadKnowledgeFile(
  agentId: string,
  file: File
): Promise<KnowledgeFile> {
  // 1. 上传文件到 Storage
  const filePath = `knowledge/${agentId}/${Date.now()}-${file.name}`
  const { data: _uploadData, error: uploadError } = await supabase.storage
    .from('knowledge')
    .upload(filePath, file)

  if (uploadError) throw uploadError

  // 2. 创建文件记录
  const { data, error } = await supabase
    .from('knowledge_files')
    .insert({
      agent_id: agentId,
      name: file.name,
      storage_path: filePath,
      mime_type: file.type,
      chunk_count: 0,
      embedding_status: 'pending',
    })
    .select()
    .single()

  if (error) throw error

  // 3. 触发向量化处理（调用 Edge Function）
  try {
    await supabase.functions.invoke('rag-ingest', {
      body: { file_id: data.id },
    })
  } catch (e) {
    console.error('Failed to trigger rag-ingest:', e)
  }

  return data
}

export async function deleteKnowledgeFile(fileId: string): Promise<void> {
  // 1. 获取文件信息
  const { data: file, error: getError } = await supabase
    .from('knowledge_files')
    .select('storage_path')
    .eq('id', fileId)
    .single()

  if (getError) throw getError

  // 2. 删除 Storage 文件
  if (file?.storage_path) {
    await supabase.storage.from('knowledge').remove([file.storage_path])
  }

  // 3. 删除数据库记录
  const { error } = await supabase
    .from('knowledge_files')
    .delete()
    .eq('id', fileId)

  if (error) throw error
}

export async function retryEmbeddings(fileId: string): Promise<void> {
  // 触发重新向量化
  await supabase.functions.invoke('rag-ingest', {
    body: { file_id: fileId },
  })
}
