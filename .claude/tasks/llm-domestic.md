# 国产 LLM Provider

> 国产大模型接入规范

## 接入优先级

| 优先级 | 模型 | 标识 | 上下文 | 说明 |
|--------|------|------|--------|------|
| **P0** | Kimi Turbo | `kimi-turbo` | 128K | 高性价比，默认首选 |
| **P0** | Kimi Pro | `kimi-pro` | 128K | 进阶能力 |
| **P1** | MiniMax abab6.5s | `minimax-abab6.5s` | 200K | 快速响应 |
| **P1** | MiniMax abab6.5g | `minimax-abab6.5g` | 200K | 联网能力 |
| **P2** | 智谱 GLM-4 | `glm-4` | 128K | 待接入 |
| **P2** | 通义千问 Qwen | `qwen-turbo` | 128K | 待接入 |

---

## Kimi (月之暗面) - P0 最高优先

### 支持的模型

| 模型 | 标识 | 上下文 | 适用场景 |
|------|------|--------|----------|
| Kimi Turbo | `kimi-turbo` | 128K | 默认首选，高性价比 |
| Kimi Pro | `kimi-pro` | 128K | 需要更强推理能力 |
| Kimi Max | `kimi-max` | 128K | 最强能力（未来） |

### API 配置

```
Base URL: https://api.moonshot.cn/v1
Auth: Bearer Token (API Key)
```

### 请求示例

```typescript
// 请求
POST /chat/completions
{
  "model": "kimi-turbo",
  "messages": [
    { "role": "system", "content": "你是一个有帮助的助手" },
    { "role": "user", "content": "你好" }
  ],
  "temperature": 0.7,
  "max_tokens": 4096
}

// 响应
{
  "id": "cmpl-xxx",
  "choices": [{
    "message": {
      "role": "assistant",
      "content": "你好！有什么可以帮助你的吗？"
    },
    "finish_reason": "stop"
  }],
  "usage": {
    "prompt_tokens": 100,
    "completion_tokens": 50,
    "total_tokens": 150
  }
}
```

---

## MiniMax - P1 第二优先

### 支持的模型

| 模型 | 标识 | 上下文 | 适用场景 |
|------|------|--------|----------|
| abab6.5s | `minimax-abab6.5s` | 200K | 快速响应，低延迟 |
| abab6.5g | `minimax-abab6.5g` | 200K | 联网搜索能力 |
| abab6.5 | `minimax-abab6.5` | 200K | 综合能力最强 |

### API 配置

```
Base URL: https://api.minimax.chat/v1
Auth: Bearer Token (API Key)
Group: 根目录传入 group 参数
```

### 请求示例

```typescript
// 请求
POST /text/chatcompletion_v2
{
  "model": "abab6.5s-chat",
  "messages": [
    { "role": "system", "content": "你是一个有帮助的助手" },
    { "role": "user", "content": "你好" }
  ],
  "temperature": 0.7,
  "max_tokens": 4096
}
```

---

## 智谱 (P2)

### 支持的模型

| 模型 | 标识 | 上下文 |
|------|------|--------|
| GLM-4 | `glm-4` | 128K |
| GLM-4V | `glm-4v` | 128K (多模态) |

### API 配置

```
Base URL: https://open.bigmodel.cn/api/paas/v4
Auth: Bearer Token
```

---

## 通义千问 (P2)

### 支持的模型

| 模型 | 标识 | 上下文 |
|------|------|--------|
| Qwen Turbo | `qwen-turbo` | 100K |
| Qwen Plus | `qwen-plus` | 64K |

### API 配置

```
Base URL: https://dashscope.aliyuncs.com/compatible-mode/v1
Auth: Bearer Token
```

---

## 实现计划

### 任务拆分

| 任务 | 说明 | 优先级 |
|------|------|--------|
| T113-K | 实现 Kimi Provider | P0 |
| T114-M | 实现 MiniMax Provider | P1 |
| T114-Z | 实现智谱 Provider | P2 |
| T114-T | 实现通义 Provider | P2 |

---

## 类型定义

```typescript
// Kimi 模型
export type KimiModel = 'kimi-turbo' | 'kimi-pro' | 'kimi-max'

// MiniMax 模型
export type MiniMaxModel = 'minimax-abab6.5s' | 'minimax-abab6.5g' | 'minimax-abab6.5'

// 智谱模型
export type ZhipuModel = 'glm-4' | 'glm-4v'

// 通义模型
export type QwenModel = 'qwen-turbo' | 'qwen-plus'

// 统一模型标识
export type DomesticModel = KimiModel | MiniMaxModel | ZhipuModel | QwenModel
```

---

## 参考文档

- Kimi API: https://platform.moonshot.cn/
- MiniMax API: https://platform.minimax.chat/
- 智谱 API: https://open.bigmodel.cn/
- 通义 API: https://dashscope.console.aliyun.com/
