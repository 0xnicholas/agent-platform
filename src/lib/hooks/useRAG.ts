/**
 * useRAG - RAG Hook
 * 知识库检索增强生成
 */

import { useState, useCallback } from 'react'
import { 
  chunkText, 
  computeEmbedding,
  similaritySearch,
  buildRAGContext,
  type TextChunk,
  type SearchResult 
} from '@lib/rag/pipeline'

interface UseRAGOptions {
  agentId: string
}

interface DocumentChunk {
  id: string
  fileId: string
  content: string
  embedding?: number[]
  metadata: {
    fileId: string
    agentId: string
    startIndex: number
    endIndex: number
  }
}

export function useRAG({ agentId }: UseRAGOptions) {
  const [chunks, setChunks] = useState<DocumentChunk[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  /**
   * 处理上传的文档 - 分块并计算嵌入
   */
  const processDocument = useCallback(async (file: File): Promise<DocumentChunk[]> => {
    setIsProcessing(true)

    try {
      // 读取文件内容
      const content = await readFileContent(file)
      
      // 文本分块
      const textChunks = chunkText(content)
      
      // 计算嵌入并创建 chunk 对象
      const processedChunks: DocumentChunk[] = []
      
      for (const chunk of textChunks) {
        const embedding = await computeEmbedding(chunk.content)
        
        processedChunks.push({
          id: chunk.id,
          fileId: file.name,
          content: chunk.content,
          embedding,
          metadata: {
            fileId: file.name,
            agentId,
            startIndex: chunk.metadata.startIndex,
            endIndex: chunk.metadata.endIndex,
          },
        })
      }

      // 更新状态
      setChunks(prev => [...prev, ...processedChunks])
      
      return processedChunks
    } finally {
      setIsProcessing(false)
    }
  }, [agentId])

  /**
   * 检索相关上下文
   */
  const retrieve = useCallback(async (query: string, topK: number = 5): Promise<SearchResult[]> => {
    if (chunks.length === 0) {
      return []
    }

    setIsSearching(true)

    try {
      // 转换为 TextChunk 格式
      const ragChunks: TextChunk[] = chunks.map(c => ({
        id: c.id,
        content: c.content,
        metadata: c.metadata,
      }))

      // 相似度检索
      const results = await similaritySearch(query, ragChunks, topK)
      
      return results
    } finally {
      setIsSearching(false)
    }
  }, [chunks])

  /**
   * 构建 RAG 上下文（用于追加到 prompt）
   */
  const getContext = useCallback(async (query: string, topK: number = 3): Promise<string> => {
    const results = await retrieve(query, topK)
    return buildRAGContext(results)
  }, [retrieve])

  /**
   * 清除所有 chunks
   */
  const clear = useCallback(() => {
    setChunks([])
  }, [])

  /**
   * 加载已有 chunks（从数据库）
   */
  const loadChunks = useCallback((existingChunks: DocumentChunk[]) => {
    setChunks(existingChunks)
  }, [])

  return {
    chunks,
    isProcessing,
    isSearching,
    processDocument,
    retrieve,
    getContext,
    clear,
    loadChunks,
  }
}

/**
 * 读取文件内容
 */
async function readFileContent(file: File): Promise<string> {
  const type = file.type

  if (type === 'text/plain' || type === 'text/markdown' || type === 'text/csv' || type === 'text/html') {
    return await file.text()
  }

  // PDF 需要服务端解析，返回提示让用户转换格式
  return `[文件: ${file.name}]\n\n此文件类型暂不支持直接读取，请转换为 txt/md 格式后重新上传。支持的格式: txt, md, csv, html`
}
