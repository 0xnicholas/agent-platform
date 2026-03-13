# ARCHITECTURE.md — 系统架构

## 整体架构

```
┌─────────────────────────────────────────────────┐
│                    前端 (React + Vite)            │
│                                                   │
│  ┌──────────┐  ┌──────────┐  ┌────────────────┐  │
│  │ Agent    │  │ Profile  │  │ Task /         │  │
│  │ Chat UI  │  │ Editor   │  │ Automation UI  │  │
│  └────┬─────┘  └────┬─────┘  └───────┬────────┘  │
│       │              │                │            │
│       └──────────────┼────────────────┘            │
│                      │ Supabase JS Client           │
└──────────────────────┼──────────────────────────────┘
                       │
┌──────────────────────┼──────────────────────────────┐
│              Supabase │                              │
│  ┌───────────────────▼──────────────────────────┐   │
│  │              Edge Functions                   │   │
│  │  ┌────────────┐  ┌──────────┐  ┌──────────┐  │   │
│  │  │ llm-chat   │  │ rag-     │  │ task-    │  │   │
│  │  │ (streaming)│  │ ingest   │  │ runner   │  │   │
│  │  └─────┬──────┘  └────┬─────┘  └────┬─────┘  │   │
│  └────────┼──────────────┼──────────────┼────────┘   │
│           │              │              │             │
│  ┌────────▼──────────────▼──────────────▼────────┐   │
│  │                  PostgreSQL                    │   │
│  │  agents / profiles / connectors / tasks /      │   │
│  │  conversations / memories / knowledge_chunks   │   │
│  └────────────────────────────────────────────────┘   │
│                                                        │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │   Storage   │  │     Auth     │  │    Vault    │  │
│  │ (知识库文件) │  │  (用户登录)  │  │(API Keys等) │  │
│  └─────────────┘  └──────────────┘  └─────────────┘  │
└────────────────────────────────────────────────────────┘
                       │
┌──────────────────────┼──────────────────────────────┐
│              外部服务 │                              │
│  ┌────────┐  ┌───────┴──┐  ┌────────┐  ┌────────┐  │
│  │Anthropic│  │ OpenAI  │  │Google  │  │Gmail / │  │
│  │ Claude  │  │  GPT-4o │  │ Gemini │  │Slack   │  │
│  └─────────┘  └──────────┘  └────────┘  └────────┘  │
└────────────────────────────────────────────────────────┘
```

---

## 模块依赖关系

```
features/agent/chat
    ├── 依赖 lib/llm/gateway（发起 LLM 调用）
    ├── 依赖 lib/prompt/buildSystemPrompt（拼装 prompt）
    ├── 依赖 lib/rag/retrieve（检索知识库）
    └── 依赖 lib/supabase/conversations（持久化对话）

features/agent/profile
    ├── 依赖 lib/supabase/agents（读写 agent 配置）
    └── 依赖 lib/prompt/buildSystemPrompt（预览 prompt）

features/agent/connectors
    ├── 依赖 lib/supabase/connectors（管理 connector 配置）
    └── 依赖 lib/connectors/[type]（各 connector 实现）

features/agent/tasks
    ├── 依赖 lib/supabase/tasks（管理 task 配置）
    └── 依赖 lib/tasks/summarize（生成 ExecutionSummary）

lib/prompt/buildSystemPrompt
    ├── 依赖 lib/rag/retrieve（注入 RAG 结果）
    └── 依赖 lib/llm/contextManager（token 裁剪）

lib/llm/gateway
    ├── 依赖 lib/llm/providers/claude
    ├── 依赖 lib/llm/providers/openai
    ├── 依赖 lib/llm/providers/gemini
    └── 依赖 lib/llm/usage（记录 token 用量）
```

---

## 数据流：用户发送一条消息

```
1. 用户在 Chat UI 输入消息，点击发送

2. useAgentChat hook 被触发
   ├── 从 Supabase 读取 agent profile + connectors + memories
   ├── 调用 buildSystemPrompt() 拼装 system prompt
   ├── 调用 rag/retrieve() 检索相关知识
   └── 构建完整 LLMRequest

3. 前端调用 Supabase Edge Function: /functions/v1/llm-chat
   ├── Edge Function 验证用户 Auth token
   ├── 检查工作区 token 配额
   └── 调用 gateway.streamLLM()

4. LLM 流式响应返回
   ├── 前端实时渲染 text chunks
   ├── 遇到 tool_call → 调用对应 Connector
   │   ├── Edge Function 从 Vault 取 credentials
   │   ├── 执行 Connector tool
   │   └── 把结果作为 tool_result 继续 LLM 调用
   └── 遇到 done → 持久化完整对话到 conversations 表

5. 异步记录 token 用量到 token_usage 表
```

---

## 数据流：Task 自动执行

```
1. pg_cron 触发调度（或事件触发）
   └── 调用 Edge Function: /functions/v1/task-runner

2. task-runner Edge Function
   ├── 读取 task 配置（prompt、agent_id）
   ├── 读取 agent profile + connectors + memories
   ├── 构建 LLMRequest（user message = task.prompt）
   └── 调用 gateway.callLLM()（非流式）

3. LLM 执行（可能多轮 tool calling）
   ├── 执行所有需要的 Connector 调用
   └── 返回最终结果

4. 生成 ExecutionSummary
   ├── 提取动作列表（做了什么）
   ├── 识别异常和告警
   └── 生成快捷入口链接

5. 写入 task_runs 表
   ├── summary = ExecutionSummary（展示给用户）
   └── raw_conversation = 完整对话（仅 debug）

6. 更新 tasks 表的 last_run_* 字段

7. （可选）通过 Supabase Realtime 推送通知到前端
```

---

## 前端状态管理

```typescript
// Zustand stores 划分

agentStore          // 当前工作区的 agent 列表
  ├── agents[]
  ├── selectedAgentId
  └── actions: createAgent / updateAgent / deleteAgent

chatStore           // 当前对话状态
  ├── conversation
  ├── isStreaming
  ├── pendingToolCall
  └── actions: sendMessage / clearConversation

taskStore           // Task 管理
  ├── tasks[]
  ├── taskRuns{}    // taskId → 最近执行记录
  └── actions: createTask / toggleTask / runTaskNow

workspaceStore      // 工作区状态
  ├── workspace
  ├── members[]
  └── tokenUsage
```

---

## 安全边界

```
前端（不可信区域）
  - 只能通过 Supabase Auth 访问数据
  - RLS 保证只能读写自己有权限的数据
  - 永远拿不到 LLM API Keys 和 Connector credentials

Edge Function（可信区域）
  - 持有所有外部服务的 API Keys
  - 执行 Connector tool 调用
  - 验证每个请求的用户身份

外部服务
  - 只接受来自 Edge Function 的请求
  - 用户 OAuth token 存 Vault，前端不可见
```
