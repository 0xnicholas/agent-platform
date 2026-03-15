/**
 * useChat - Chat Hook
 * 处理对话流程，包括 LLM 调用和工具执行
 */

import { useState, useCallback, useRef } from 'react'
import { sendChatMessageStream } from '@lib/supabase/chat'
import { executeTool, type ToolExecutionResult } from '@lib/tools/executor'
import { useChatStore, type ChatMessage } from '@stores/chatStore'

// 简单 ID 生成器
const generateId = () => Math.random().toString(36).substring(2, 15)

interface UseChatOptions {
  agentId: string
  agentConfig?: {
    model?: string
    temperature?: number
    connectors?: Record<string, any>
  }
  onMessage?: (message: ChatMessage) => void
}

export function useChat({ agentId, agentConfig, onMessage }: UseChatOptions) {
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  const {
    messages,
    addMessage,
    updateMessage,
    addToolCall,
    updateToolCall,
    clearMessages,
  } = useChatStore()

  /**
   * 发送消息并处理响应
   */
  const sendMessage = useCallback(async (content: string) => {
    // 添加用户消息
    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    }
    addMessage(userMessage)
    onMessage?.(userMessage)

    // 添加空的助手消息（用于流式输出）
    const assistantMessage: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
      toolCalls: [],
    }
    addMessage(assistantMessage)

    setIsLoading(true)
    setIsStreaming(true)

    try {
      // 准备消息历史
      const messageHistory = [
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user' as const, content },
      ]

      let fullContent = ''

      // 流式调用 LLM
      await sendChatMessageStream(
        agentId,
        messageHistory,
        (chunk) => {
          fullContent += chunk
          updateMessage(assistantMessage.id, { content: fullContent })
        },
        {
          model: agentConfig?.model,
          temperature: agentConfig?.temperature,
        }
      )

      setIsStreaming(false)

      // 检查是否有工具调用（这部分需要 Edge Function 返回 tool_calls）
      // 目前是简化版，实际会从 Edge Function 获取
      const hasToolCalls = false // TODO: 从响应中解析

      if (hasToolCalls) {
        // 处理工具调用
        await handleToolCalls(assistantMessage.id, [], agentConfig?.connectors || {})
      }

    } catch (error) {
      console.error('Chat error:', error)
      updateMessage(assistantMessage.id, {
        content: '抱歉，发生了一些错误。请稍后重试。',
      })
    } finally {
      setIsLoading(false)
      setIsStreaming(false)
    }
  }, [agentId, messages, agentConfig, addMessage, updateMessage, onMessage])

  /**
   * 处理工具调用
   */
  const handleToolCalls = useCallback(async (
    messageId: string,
    toolCalls: Array<{ id: string; name: string; input: Record<string, unknown> }>,
    config: Record<string, any>
  ) => {
    for (const toolCall of toolCalls) {
      // 添加工具调用到消息
      addToolCall(messageId, {
        id: toolCall.id,
        name: toolCall.name,
        input: toolCall.input,
        status: 'executing',
      })

      // 执行工具
      const result: ToolExecutionResult = await executeTool(
        toolCall.name,
        toolCall.input,
        {
          agentId,
          workspaceId: '',
          config,
        }
      )

      // 更新工具调用状态
      updateToolCall(messageId, toolCall.id, {
        status: result.error ? 'error' : 'completed',
        result: result.error || JSON.stringify(result.result),
      })

      // 如果执行成功，将结果发送回 LLM
      if (!result.error) {
        // TODO: 继续对话 with tool result
      }
    }
  }, [agentId, addToolCall, updateToolCall])

  /**
   * 停止流式输出
   */
  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setIsStreaming(false)
    setIsLoading(false)
  }, [])

  /**
   * 清除消息历史
   */
  const clear = useCallback(() => {
    clearMessages()
  }, [clearMessages])

  return {
    messages,
    isLoading,
    isStreaming,
    sendMessage,
    stopStreaming,
    clear,
  }
}
