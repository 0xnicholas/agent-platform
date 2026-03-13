# LLM_GATEWAY.md — 多模型网关设计

## 设计原则

所有 LLM 调用必须通过统一网关，业务代码不直接接触任何 provider SDK。网关负责：模型路由、参数标准化、流式处理、错误重试、token 计量。

---

## 支持的模型

| 模型标识 | Provider | 上下文窗口 | 适用场景 |
|---|---|---|---|
| `claude-sonnet-4-6` | Anthropic | 200K | 默认推荐，综合能力强 |
| `claude-opus-4-6` | Anthropic | 200K | 复杂推理，成本较高 |
| `gpt-4o` | OpenAI | 128K | 工具调用稳定性好 |
| `gpt-4o-mini` | OpenAI | 128K | 低成本场景 |
| `gemini-2.0-flash` | Google | 1M | 长上下文场景 |

---

## 统一接口定义

```typescript
// src/lib/llm/types.ts

export interface Message {
  role: 'user' | 'assistant' | 'tool'
  content: string | ContentBlock[]
  toolCallId?: string  // role=tool 时必填
}

export interface ContentBlock {
  type: 'text' | 'tool_use' | 'tool_result'
  text?: string
  toolUseId?: string
  toolName?: string
  toolInput?: Record<string, unknown>
  content?: string
}

export interface ToolDefinition {
  name: string
  description: string
  inputSchema: {
    type: 'object'
    properties: Record<string, unknown>
    required?: string[]
  }
}

export interface ToolCall {
  id: string
  name: string
  input: Record<string, unknown>
}

export type ModelId =
  | 'claude-sonnet-4-6'
  | 'claude-opus-4-6'
  | 'gpt-4o'
  | 'gpt-4o-mini'
  | 'gemini-2.0-flash'

export interface ModelConfig {
  model: ModelId
  maxTokens?: number       // 默认 4096
  temperature?: number     // 默认 0.7，范围 0-1
  topP?: number
}

export interface LLMRequest {
  systemPrompt: string
  messages: Message[]
  tools?: ToolDefinition[]
  modelConfig: ModelConfig
  stream?: boolean
  // 用于记录 token 用量
  metadata?: {
    workspaceId: string
    agentId: string
    sourceType: 'conversation' | 'task_run'
    sourceId: string
  }
}

export interface LLMResponse {
  content: string
  toolCalls?: ToolCall[]
  stopReason: 'end_turn' | 'tool_use' | 'max_tokens' | 'error'
  usage: {
    inputTokens: number
    outputTokens: number
  }
  model: string
}

export type StreamChunk =
  | { type: 'text'; text: string }
  | { type: 'tool_call'; toolCall: ToolCall }
  | { type: 'done'; usage: LLMResponse['usage'] }
  | { type: 'error'; message: string }
```

---

## 网关实现

```typescript
// src/lib/llm/gateway.ts

import { callClaude } from './providers/claude'
import { callOpenAI } from './providers/openai'
import { callGemini } from './providers/gemini'
import { recordTokenUsage } from './usage'
import type { LLMRequest, LLMResponse, StreamChunk } from './types'

export async function callLLM(request: LLMRequest): Promise<LLMResponse> {
  const { modelConfig } = request

  let response: LLMResponse

  try {
    if (modelConfig.model.startsWith('claude')) {
      response = await callClaude(request)
    } else if (modelConfig.model.startsWith('gpt')) {
      response = await callOpenAI(request)
    } else if (modelConfig.model.startsWith('gemini')) {
      response = await callGemini(request)
    } else {
      throw new Error(`不支持的模型: ${modelConfig.model}`)
    }
  } catch (error) {
    // 统一错误处理，抛出标准化错误
    throw normalizeLLMError(error, modelConfig.model)
  }

  // 异步记录 token 用量，不阻塞响应
  if (request.metadata) {
    recordTokenUsage(request.metadata, response.usage, modelConfig.model)
      .catch(console.error)
  }

  return response
}

export async function* streamLLM(
  request: LLMRequest
): AsyncGenerator<StreamChunk> {
  const { modelConfig } = request

  if (modelConfig.model.startsWith('claude')) {
    yield* streamClaude(request)
  } else if (modelConfig.model.startsWith('gpt')) {
    yield* streamOpenAI(request)
  } else if (modelConfig.model.startsWith('gemini')) {
    yield* streamGemini(request)
  } else {
    yield { type: 'error', message: `不支持的模型: ${modelConfig.model}` }
  }
}
```

---

## 各 Provider 差异处理

### Anthropic Claude

```typescript
// src/lib/llm/providers/claude.ts
// API Key 从 Supabase Edge Function 环境变量读取，不暴露前端

// 注意事项：
// 1. system prompt 是独立参数，不在 messages 数组里
// 2. tool_use 和 tool_result 的消息结构与 OpenAI 不同
// 3. stopReason 映射：'end_turn' → 'end_turn', 'tool_use' → 'tool_use'
// 4. usage 字段名：input_tokens / output_tokens
```

### OpenAI GPT

```typescript
// src/lib/llm/providers/openai.ts

// 注意事项：
// 1. system prompt 作为 role=system 的第一条 message
// 2. function calling 格式与 Claude 不同，需要转换
// 3. stopReason 映射：'stop' → 'end_turn', 'tool_calls' → 'tool_use'
// 4. usage 字段名：prompt_tokens / completion_tokens（需重命名）
```

### Google Gemini

```typescript
// src/lib/llm/providers/gemini.ts

// 注意事项：
// 1. system prompt 通过 system_instruction 参数传递
// 2. 消息格式使用 parts 数组
// 3. tool 格式与前两者都不同，需要独立转换
// 4. stopReason 映射：'STOP' → 'end_turn', 'MAX_TOKENS' → 'max_tokens'
```

---

## Token 限制与裁剪策略

```typescript
// src/lib/llm/contextManager.ts

const MODEL_LIMITS: Record<string, number> = {
  'claude-sonnet-4-6': 200000,
  'claude-opus-4-6': 200000,
  'gpt-4o': 128000,
  'gpt-4o-mini': 128000,
  'gemini-2.0-flash': 1000000,
}

// 安全上限：预留 4096 token 给输出
const SAFE_INPUT_LIMIT = (model: string) =>
  (MODEL_LIMITS[model] ?? 128000) - 4096

// 超限时的裁剪优先级（从低到高，越高越重要越不裁剪）：
// 1. 早期对话历史（最先裁剪）
// 2. RAG 检索结果（次之）
// 3. Memory saved facts（再次）
// 4. System prompt（尽量保留）
// 5. 最近 4 条对话（必须保留）
// 6. 当前 user message（必须保留）
export function trimContext(request: LLMRequest): LLMRequest {
  // 实现裁剪逻辑
}
```

---

## 错误处理规范

```typescript
// src/lib/llm/errors.ts

export class LLMError extends Error {
  constructor(
    message: string,
    public code: LLMErrorCode,
    public provider: string,
    public retryable: boolean
  ) {
    super(message)
  }
}

export type LLMErrorCode =
  | 'RATE_LIMIT'        // 触发限流，retryable=true
  | 'CONTEXT_TOO_LONG'  // token 超限，retryable=false
  | 'INVALID_API_KEY'   // API Key 无效，retryable=false
  | 'MODEL_UNAVAILABLE' // 模型暂不可用，retryable=true
  | 'TIMEOUT'           // 请求超时，retryable=true
  | 'UNKNOWN'           // 未知错误

// 重试策略
// RATE_LIMIT：指数退避，最多 3 次，间隔 1s / 2s / 4s
// MODEL_UNAVAILABLE：等待 5s 后重试一次
// TIMEOUT：直接重试一次
// 其他：不重试，直接抛出
```

---

## 所有 LLM 调用必须走 Supabase Edge Function

前端不直接调用 LLM API，所有请求通过 Edge Function 代理：

```
前端 → POST /functions/v1/llm-chat
           ↓
      Edge Function（持有 API Keys）
           ↓
      callLLM / streamLLM
           ↓
      Provider API
```

Edge Function 负责：
1. 验证 Supabase Auth token（确认用户已登录）
2. 检查工作区配额（token 用量是否超限）
3. 调用对应 provider
4. 返回结果 / 流式响应

---

## 重要约定

- API Key 只存 Edge Function 环境变量，绝不出现在前端代码
- 前端通过 Supabase client 调用 Edge Function，携带用户 Auth token
- 每次调用必须记录 token 用量（异步，不阻塞响应）
- 流式响应使用 Server-Sent Events（SSE）格式
- 单次请求超时设置为 120 秒（agent 执行可能较慢）
