/**
 * Files 页面 - 知识库文件管理
 */

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Upload, FileText, Trash2, Download, Eye, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { PageContainer } from '@components/layout/PageContainer'
import { Button } from '@components/ui/Button'
import { Card, CardContent } from '@components/ui/Card'
import { Badge } from '@components/ui/Badge'
import { Input } from '@components/ui/Input'
import { 
  getKnowledgeFiles, 
  uploadKnowledgeFile, 
  deleteKnowledgeFile, 
  retryEmbeddings,
  type KnowledgeFile 
} from '@lib/supabase/knowledgeFiles'
import { getAgents } from '@lib/supabase/agents'

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
  'text/csv',
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export function FilesPage() {
  const { id: agentId } = useParams<{ id: string }>()
  const params = useParams()
  const actualAgentId = agentId || params.id as string | undefined
  
  const [files, setFiles] = useState<KnowledgeFile[]>([])
  const [agents, setAgents] = useState<{ id: string; name: string }[]>([])
  const [selectedAgentId, setSelectedAgentId] = useState<string>(actualAgentId || '')
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (actualAgentId) {
      setSelectedAgentId(actualAgentId)
    }
  }, [actualAgentId])

  useEffect(() => {
    loadData()
  }, [selectedAgentId])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [filesData, agentsData] = await Promise.all([
        getKnowledgeFiles(selectedAgentId || undefined),
        !actualAgentId && !agentId ? getAgents() : Promise.resolve([]),
      ])
      setFiles(filesData)
      if (!actualAgentId && !agentId) setAgents(agentsData)
    } catch (error) {
      console.error('Failed to load files:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!selectedAgentId) {
      alert('请先选择一个 Agent')
      return
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      alert('不支持的文件类型')
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      alert('文件大小不能超过 10MB')
      return
    }

    setIsUploading(true)
    try {
      await uploadKnowledgeFile(selectedAgentId, file)
      loadData()
    } catch (error) {
      console.error('Failed to upload file:', error)
      alert('上传失败')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDelete = async (fileId: string) => {
    if (!confirm('确定要删除这个文件吗？')) return
    try {
      await deleteKnowledgeFile(fileId)
      loadData()
    } catch (error) {
      console.error('Failed to delete file:', error)
      alert('删除失败')
    }
  }

  const handleRetry = async (fileId: string) => {
    try {
      await retryEmbeddings(fileId)
      alert('已重新开始向量化处理')
      loadData()
    } catch (error) {
      console.error('Failed to retry:', error)
    }
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-500 animate-pulse" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const statusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'processing':
        return 'warning'
      case 'failed':
        return 'error'
      default:
        return 'default'
    }
  }

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <PageContainer
      title="知识库"
      description="管理 Agent 的知识文件"
      actions={
        <div className="flex items-center gap-2">
          {!actualAgentId && !agentId && (
            <select
              className="px-3 py-2 border rounded-lg text-sm"
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
            >
              <option value="">选择 Agent</option>
              {agents.map(agent => (
                <option key={agent.id} value={agent.id}>{agent.name}</option>
              ))}
            </select>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_TYPES.join(',')}
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={isUploading || !selectedAgentId}
          >
            <Upload className="w-4 h-4 mr-2" />
            {isUploading ? '上传中...' : '上传文件'}
          </Button>
        </div>
      }
    >
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full" />
        </div>
      ) : filteredFiles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-4">还没有上传文件</p>
            <p className="text-sm text-gray-400 mb-6">
              支持 PDF、Word、TXT、Markdown 等格式
            </p>
            {selectedAgentId ? (
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                上传第一个文件
              </Button>
            ) : (
              <p className="text-sm text-yellow-600">请先选择一个 Agent</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* 搜索 */}
          <div className="mb-4">
            <Input 
              placeholder="搜索文件..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm" 
            />
          </div>

          {/* 文件列表 */}
          <div className="grid gap-4">
            {filteredFiles.map((file) => (
              <Card key={file.id}>
                <CardContent className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{file.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-gray-500">
                          {file.chunk_count} 个片段
                        </span>
                        <Badge variant={statusVariant(file.embedding_status) as any}>
                          {file.embedding_status === 'completed' ? '已完成' :
                           file.embedding_status === 'processing' ? '处理中' :
                           file.embedding_status === 'failed' ? '失败' : '待处理'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {statusIcon(file.embedding_status)}
                    {file.embedding_status === 'failed' && (
                      <Button variant="ghost" size="sm" onClick={() => handleRetry(file.id)} title="重新处理">
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(file.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 说明 */}
      <Card className="mt-6">
        <CardContent>
          <h3 className="font-medium mb-2">支持的文件格式</h3>
          <div className="flex flex-wrap gap-2">
            <Badge>PDF</Badge>
            <Badge>Word</Badge>
            <Badge>TXT</Badge>
            <Badge>Markdown</Badge>
            <Badge>CSV</Badge>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            文件会自动分块并向量化，用于 RAG 检索。最大支持 10MB。
          </p>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
