/**
 * LLM Gateway 统一入口
 * 多模型路由：Kimi / MiniMax / Claude / GPT / Gemini
 */

import { callKimi, streamKimi } from './providers/kimi'
import { callMiniMax, streamMiniMax } from './providers/minimax'
import type { LLMRequest, LLMResponse, ModelConfig } from './types'

// API Keys - 从环境变量获取
const API_KEYS = {
  kimi: process.env.KIMI_API_KEY || '',
  minimax: process.env.MINIMAX_API_KEY || '',
  anthropic: process.env.ANTHROPIC_API_KEY || '',
  openai: process.env.OPENAI_API_KEY || '',
  google: process.env.GOOGLE_API_KEY || '',
}

/**
 * 获取指定 provider 的 API Key
 */
function getApiKey(provider: string): string {
  const key = API_KEYS[provider as keyof typeof API_KEYS]
  if (!key) {
    throw new Error(`API Key not configured for provider: ${provider}`)
  }
  return key
}

/**
 * 统一的 LLM 调用入口
 */
export async function callLLM(request: LLMRequest): Promise<LLMResponse> {
  const { systemPrompt, messages, tools, modelConfig } = request

  const provider = getProvider(modelConfig.model)
  const apiKey = getApiKey(provider)

  try {
    if (provider === 'kimi') {
      return await callKimi(systemPrompt, messages, tools, modelConfig, apiKey)
    }

    if (provider === 'minimax') {
      return await callMiniMax(systemPrompt, messages, tools, modelConfig, apiKey)
    }

    throw new Error(`Provider ${provider} not implemented yet`)
  } catch (error) {
    throw normalizeError(error, provider)
  }
}

/**
 * 流式 LLM 调用入口
 */
export async function* streamLLM(
  request: LLMRequest
): AsyncGenerator<{ type: 'text'; text: string } | { type: 'done'; usage: { inputTokens: number; outputTokens: number } } | { type: 'error'; message: string }> {
  const { systemPrompt, messages, tools, modelConfig } = request

  const provider = getProvider(modelConfig.model)
  const apiKey = getApiKey(provider)

  try {
    if (provider === 'kimi') {
      yield* streamKimi(systemPrompt, messages, tools, modelConfig, apiKey)
      return
    }

    if (provider === 'minimax') {
      yield* streamMiniMax(systemPrompt, messages, tools, modelConfig, apiKey)
      return
    }

    throw new Error(`Provider ${provider} not implemented yet`)
  } catch (error) {
    yield { type: 'error', message: normalizeError(error, provider).message }
  }
}

/**
 * 根据模型获取 provider
 */
function getProvider(model: string): string {
  if (model.startsWith('kimi')) return 'kimi'
  if (model.startsWith('minimax')) return 'minimax'
  if (model.startsWith('claude')) return 'anthropic'
  if (model.startsWith('gpt')) return 'openai'
  if (model.startsWith('gemini')) return 'google'
  return 'kimi' // 默认
}

/**
 * 错误标准化
 */
function normalizeError(error: unknown, provider: string): Error {
  if (error instanceof Error) {
    return error
  }
  return new Error(`Unknown error from ${provider}: ${error}`)
}

/**
 * Token 限制
 */
export const MODEL_LIMITS: Record<string, number> = {
  'kimi-turbo': 128000,
  'kimi-pro': 128000,
  'minimax-abab6.5s': 200000,
  'minimax-abab6.5g': 200000,
  'minimax-abab6.5': 200000,
  'claude-sonnet-4-6': 200000,
  'claude-opus-4-6': 200000,
  'gpt-4o': 128000,
  'gpt-4o-mini': 128000,
  'gemini-2.0-flash': 1000000,
}

/**
 * 安全输入上限（预留 4096 给输出）
 */
export function getSafeInputLimit(model: string): number {
  return (MODEL_LIMITS[model] || 128000) - 4096
}
