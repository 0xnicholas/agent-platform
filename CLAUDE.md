# CLAUDE.md — Agent Platform 项目指南

## 项目概述

这是一个类 Base44 的 Agent 创建平台，允许业务用户通过自然语言配置、发布和管理 AI Agent。核心理念：**万物皆 Agent**，App、Automation、Chatbot 统一为同一种可配置的运行单元。

**技术栈**
- 前端：React + Vite + TypeScript + Tailwind CSS
- 后端/数据库：Supabase（Auth、Database、Storage、Edge Functions）
- LLM：多模型支持（Claude、Kimi, MiniMax），通过统一 LLM 网关抽象
- 状态管理：Zustand
- 路由：React Router v6

---

## 项目结构

```
src/
├── components/          # 通用 UI 组件
│   ├── ui/              # 基础组件（Button, Input, Modal...）
│   └── shared/          # 业务通用组件
├── features/            # 按功能模块划分
│   ├── agent/           # Agent 核心（创建、配置、运行）
│   │   ├── profile/     # Profile 配置（等同 Base44 Brain）
│   │   ├── connectors/  # Connector 管理
│   │   ├── tasks/       # Tasks / Automations
│   │   └── chat/        # Agent 对话界面
│   ├── marketplace/     # Agent 市场
│   └── workspace/       # 工作区管理
├── lib/
│   ├── llm/             # LLM 网关（多模型统一接口）
│   ├── supabase/        # Supabase 客户端和类型
│   ├── prompt/          # System prompt 拼装逻辑
│   └── rag/             # RAG 检索管道
├── hooks/               # 全局 custom hooks
├── stores/              # Zustand stores
└── types/               # 全局 TypeScript 类型
```

---

## 文档索引
- 系统架构 → @.claude/ARCHITECTURE.md
- 数据库设计 → @.claude/DATABASE.md
- 功能规格 → @.claude/FEATURES.md
- LLM 网关 → @.claude/LLM_GATEWAY.md
- Connector 规范 → @.claude/CONNECTORS.md
- RAG 管道 → @.claude/RAG.md
- 开发进度 → @.claude/TASKS.md（每次开始前更新）
- 技术决策 → @.claude/DECISIONS.md

---

## 核心概念与实现

### 1. Agent 的本质

用户在平台上配置的一切，最终被拼装成一次 LLM 调用：

```typescript
// 一次 Agent 执行的完整结构
interface AgentExecution {
  systemPrompt: string      // 由 Profile + Knowledge + Memory 动态拼装
  tools: ToolDefinition[]   // 由 Connectors 注册的 function calling
  messages: Message[]       // 对话历史 + 当前 user message
  model: ModelConfig        // 使用哪个 LLM
}
```

### 2. Profile 模块（核心配置）

Profile 是 Agent 的身份配置中心，替代 Base44 的 Brain 概念：

```typescript
interface Profile {
  id: string
  // 身份
  name: string
  avatar: string
  description: string
  // 行为（注入 system prompt）
  identity: string          // 角色设定
  principles: string        // 行为原则
  tone: string              // 沟通风格
  // 知识
  knowledgeFiles: KnowledgeFile[]  // RAG 文档
  userContext: string              // 服务对象背景
  // 记忆
  savedFacts: string[]      // 持久化记忆
  // 模型配置
  modelConfig: ModelConfig
}
```

**System prompt 拼装顺序**（重要，影响 LLM 效果）：

```typescript
// src/lib/prompt/buildSystemPrompt.ts
export function buildSystemPrompt(profile: Profile, memory: Memory): string {
  return [
    `# 角色设定\n${profile.identity}`,
    `# 行为原则\n${profile.principles}`,
    `# 沟通风格\n${profile.tone}`,
    profile.userContext ? `# 用户背景\n${profile.userContext}` : '',
    memory.savedFacts.length > 0
      ? `# 记住的信息\n${memory.savedFacts.join('\n')}`
      : '',
    `# 当前时间\n${new Date().toISOString()}`,
  ].filter(Boolean).join('\n\n')
}
```

### 3. LLM 网关（多模型统一接口）

所有 LLM 调用必须通过网关，禁止在业务代码里直接调用 SDK：

```typescript
// src/lib/llm/gateway.ts
interface LLMRequest {
  messages: Message[]
  systemPrompt: string
  tools?: ToolDefinition[]
  model: 'claude-sonnet-4-6' | 'gpt-4o' | 'gemini-2.0-flash'
  stream?: boolean
}

interface LLMResponse {
  content: string
  toolCalls?: ToolCall[]
  usage: { inputTokens: number; outputTokens: number }
  model: string
}

export async function callLLM(request: LLMRequest): Promise<LLMResponse> {
  // 根据 model 字段路由到对应的 provider
  // 统一处理错误、重试、token 计数
}
```

### 4. Connectors（Function Calling 抽象）

每个 Connector 注册为一组 LLM 可调用的 tools：

```typescript
interface Connector {
  id: string
  type: 'gmail' | 'slack' | 'github' | 'notion' | 'custom'
  name: string
  // OAuth 凭证（存 Supabase，不暴露前端）
  credentials: ConnectorCredentials
  // 对应的 function calling 定义
  tools: ToolDefinition[]
  // tool 执行器
  execute: (toolName: string, args: Record<string, unknown>) => Promise<unknown>
}
```

### 5. Tasks（定时/触发执行）

Task 本质是带调度条件的自动对话：

```typescript
interface Task {
  id: string
  agentId: string
  name: string
  // 触发条件
  trigger: CronTrigger | EventTrigger
  // 注入给 agent 的 user message
  prompt: string
  // 执行状态
  lastRunAt: string
  lastRunStatus: 'success' | 'partial' | 'failed'
  // 执行摘要（结构化，非原始对话）
  lastRunSummary: ExecutionSummary
}

interface ExecutionSummary {
  status: 'success' | 'partial' | 'failed'
  duration: number
  actions: ActionLog[]        // 做了什么（人话描述）
  alerts: AlertLog[]          // 需要用户关注的异常
  quickLinks: QuickLink[]     // 可操作的快捷入口
}
```

---

## Supabase 数据库 Schema

```sql
-- agents 表（核心实体）
create table agents (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id),
  name text not null,
  description text,
  profile jsonb not null default '{}',     -- Profile 配置
  model_config jsonb not null default '{}', -- 模型选择和参数
  is_published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- connectors 表
create table connectors (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references agents(id) on delete cascade,
  type text not null,
  name text not null,
  credentials_ref text,  -- 指向 Supabase Vault 的引用，绝不明文存储
  tools jsonb not null default '[]',
  created_at timestamptz default now()
);

-- tasks 表
create table tasks (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references agents(id) on delete cascade,
  name text not null,
  trigger jsonb not null,
  prompt text not null,
  is_active boolean default true,
  last_run_at timestamptz,
  last_run_status text,
  last_run_summary jsonb,
  created_at timestamptz default now()
);

-- memories 表（Agent 跨会话记忆）
create table memories (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references agents(id) on delete cascade,
  type text not null,  -- 'fact' | 'session_summary'
  content text not null,
  created_at timestamptz default now()
);

-- knowledge_files 表
create table knowledge_files (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references agents(id) on delete cascade,
  name text not null,
  storage_path text not null,   -- Supabase Storage 路径
  chunk_count int default 0,
  embedding_status text default 'pending',
  created_at timestamptz default now()
);

-- conversations 表
create table conversations (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references agents(id) on delete cascade,
  messages jsonb not null default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- task_runs 表（执行历史）
create table task_runs (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references tasks(id) on delete cascade,
  status text not null,
  summary jsonb,
  raw_conversation jsonb,   -- 完整对话记录，仅供 debug
  started_at timestamptz default now(),
  finished_at timestamptz
);
```

---

## 开发规范

### 文件命名
- 组件：PascalCase，`AgentCard.tsx`
- hooks：camelCase，`useAgentExecution.ts`
- 工具函数：camelCase，`buildSystemPrompt.ts`
- 类型文件：camelCase，`agent.types.ts`

### TypeScript 规范
- 所有函数必须有明确的返回类型
- 禁止使用 `any`，用 `unknown` 替代
- Supabase 返回值必须做 null 检查
- API 响应必须用 Zod 做 runtime 校验

### 组件规范
- 每个 feature 下的组件只服务该 feature，通用组件放 `components/`
- 禁止在组件里直接调用 Supabase 或 LLM，通过 hooks 封装
- 所有异步操作必须处理 loading / error 状态

### LLM 调用规范
- 所有调用必须通过 `src/lib/llm/gateway.ts`
- 禁止在前端直接暴露 API Key，通过 Supabase Edge Functions 代理
- Stream 响应用 `ReadableStream` 处理，及时释放资源
- 每次调用记录 token 用量到数据库

### 安全规范
- Connector credentials 只存 Supabase Vault，前端永远拿不到明文
- 所有 Supabase 查询必须依赖 RLS（Row Level Security）
- Agent 执行的 function calling 结果必须在服务端校验，不信任 LLM 输出

---

## 关键实现路径

**Phase 1：Agent 基础**
1. Supabase 项目初始化 + Schema 创建 + RLS 配置
2. LLM 网关实现（先支持 Claude，再扩展）
3. Profile 配置 UI + System prompt 拼装
4. 基础对话界面（streaming）

**Phase 2：Connector 体系**
1. Connector 抽象接口设计
2. Gmail / Slack OAuth 接入
3. Function calling 执行管道
4. Connector 管理 UI

**Phase 3：Tasks + Automation**
1. Task 调度（Supabase pg_cron 或 Edge Functions + cron）
2. 执行摘要结构化生成
3. Task 历史和监控 UI

**Phase 4：RAG + Memory**
1. 文件上传 → 分块 → 向量化（pgvector）
2. 检索管道（相似度搜索 + rerank）
3. Memory 持久化和注入逻辑

---

## 禁止事项

- 禁止在 React 组件里直接 `fetch` LLM API
- 禁止把 API Key 写入前端代码或 `.env` 前端变量（`VITE_` 前缀的都会暴露）
- 禁止跳过 LLM 网关直接调用 provider SDK
- 禁止在没有 RLS 的情况下暴露 Supabase 表
- 禁止在 Task 执行时把完整 raw conversation 展示给用户，只展示 ExecutionSummary
- 禁止一个组件承担超过一个职责（单一职责原则）
