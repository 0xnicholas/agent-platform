/**
 * RAG Pipeline - 文件分块与向量化
 * 支持文档上传、分块、嵌入、相似度检索
 */

export interface TextChunk {
  id: string
  content: string
  metadata: {
    fileId: string
    agentId: string
    startIndex: number
    endIndex: number
    page?: number
  }
}

export interface EmbeddingResult {
  chunkId: string
  embedding: number[]
}

export interface SearchResult {
  chunkId: string
  content: string
  score: number
  metadata: TextChunk['metadata']
}

/**
 * 分块配置
 */
export interface ChunkConfig {
  chunkSize: number      // 默认 500
  chunkOverlap: number   // 默认 50
  separators: string[]   // 分割符
}

/**
 * 默认分块配置
 */
export const defaultChunkConfig: ChunkConfig = {
  chunkSize: 500,
  chunkOverlap: 50,
  separators: ['\n\n', '\n', '。', '！', '？', '. ', '! ', '? ', ' '],
}

/**
 * 文本分块 - 滑动窗口方式
 */
export function chunkText(text: string, config: ChunkConfig = defaultChunkConfig): TextChunk[] {
  const { chunkSize, chunkOverlap, separators } = config
  const chunks: TextChunk[] = []

  if (!text || text.length === 0) {
    return chunks
  }

  // 先按句子分割
  const sentences = splitIntoSentences(text, separators)
  
  let currentChunk = ''
  let startIndex = 0
  let chunkId = 0

  for (const sentence of sentences) {
    // 如果单句超长，继续按单词分割
    if (sentence.length > chunkSize) {
      // 先保存当前累积的
      if (currentChunk) {
        chunks.push(createChunk(String(chunkId++), currentChunk, startIndex, text))
        startIndex += currentChunk.length
        currentChunk = ''
      }
      
      // 对长句进行强制分块
      const subChunks = chunkLongText(sentence, chunkSize, chunkOverlap)
      for (const subChunk of subChunks) {
        chunks.push(createChunk(String(chunkId++), subChunk.content, subChunk.startIndex, text))
      }
      startIndex += sentence.length
      continue
    }

    // 检查是否需要新 chunk
    if (currentChunk.length + sentence.length > chunkSize && currentChunk.length > 0) {
      chunks.push(createChunk(String(chunkId++), currentChunk, startIndex, text))
      // 保留 overlap 部分
      const overlapText = currentChunk.slice(-chunkOverlap)
      startIndex += currentChunk.length - chunkOverlap
      currentChunk = overlapText + sentence
    } else {
      currentChunk += sentence
    }
  }

  // 处理最后一个 chunk
  if (currentChunk.trim()) {
    chunks.push(createChunk(String(chunkId++), currentChunk, startIndex, text))
  }

  return chunks
}

/**
 * 句子分割
 */
function splitIntoSentences(text: string, separators: string[]): string[] {
  let result = [text]
  
  for (const sep of separators) {
    const newResult: string[] = []
    for (const part of result) {
      if (part.length < 100) {
        newResult.push(part)
      } else {
        const split = part.split(sep)
        newResult.push(...split.filter(s => s.trim()))
      }
    }
    result = newResult
  }

  return result.filter(s => s.trim().length > 0)
}

/**
 * 长文本强制分块
 */
function chunkLongText(text: string, chunkSize: number, chunkOverlap: number): Array<{content: string, startIndex: number}> {
  const chunks: Array<{content: string, startIndex: number}> = []
  
  for (let i = 0; i < text.length; i += chunkSize - chunkOverlap) {
    const chunk = text.slice(i, i + chunkSize)
    if (chunk.trim()) {
      chunks.push({ content: chunk, startIndex: i })
    }
  }

  return chunks
}

/**
 * 创建 chunk 对象
 */
function createChunk(id: string, content: string, startIndex: number, fullText: string): TextChunk {
  return {
    id,
    content: content.trim(),
    metadata: {
      fileId: '',
      agentId: '',
      startIndex,
      endIndex: startIndex + content.length,
    },
  }
}

/**
 * 计算文本嵌入（placeholder - 需要调用 embedding API）
 */
export async function computeEmbedding(text: string): Promise<number[]> {
  // TODO: 实现实际的 embedding 调用
  // 这里返回一个模拟的 embedding 向量
  const dimension = 1536 // OpenAI ada-002 dimension
  const embedding = new Array(dimension).fill(0)
  
  // 简单基于文本内容的伪随机
  for (let i = 0; i < text.length; i++) {
    embedding[i % dimension] += text.charCodeAt(i)
  }
  
  // 归一化
  const norm = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0))
  return embedding.map(v => v / norm)
}

/**
 * 批量计算嵌入
 */
export async function computeEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
  const results: EmbeddingResult[] = []
  
  for (let i = 0; i < texts.length; i++) {
    const embedding = await computeEmbedding(texts[i])
    results.push({
      chunkId: String(i),
      embedding,
    })
  }

  return results
}

/**
 * 余弦相似度计算
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have same dimension')
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

/**
 * 相似度检索
 */
export async function similaritySearch(
  query: string,
  chunks: TextChunk[],
  topK: number = 5
): Promise<SearchResult[]> {
  // 计算 query 的 embedding
  const queryEmbedding = await computeEmbedding(query)

  // 计算每个 chunk 的相似度
  const results: SearchResult[] = []

  for (const chunk of chunks) {
    const chunkEmbedding = await computeEmbedding(chunk.content)
    const score = cosineSimilarity(queryEmbedding, chunkEmbedding)

    results.push({
      chunkId: chunk.id,
      content: chunk.content,
      score,
      metadata: chunk.metadata,
    })
  }

  // 排序并返回 topK
  results.sort((a, b) => b.score - a.score)
  return results.slice(0, topK)
}

/**
 * 将 chunks 转换为 RAG 格式消息
 */
export function buildRAGContext(searchResults: SearchResult[]): string {
  if (searchResults.length === 0) {
    return ''
  }

  const contextParts = searchResults.map((result, index) => {
    return `[参考 ${index + 1}] (相关度: ${(result.score * 100).toFixed(1)}%)\n${result.content}`
  })

  return `以下是相关的上下文信息：\n\n${contextParts.join('\n\n')}`
}
