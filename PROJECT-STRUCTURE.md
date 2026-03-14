# Agent Platform 项目结构

> 前后端一体化项目结构

---

## 目录结构

```
/root/agent-platform/
│
├── # ===================
│   # 前端代码 (React)
│   # ===================
│
├── src/                          # 前端源码
│   │
│   ├── main.tsx                 # 入口文件
│   ├── App.tsx                  # 路由配置
│   ├── index.css                 # 全局样式
│   │
│   ├── components/               # 组件
│   │   ├── ui/                  # 基础 UI 组件
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Textarea.tsx
│   │   │   ├── Switch.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── Tooltip.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── Loading.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── Tabs.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── layout/              # 布局组件
│   │   │   ├── Layout.tsx       # 主布局
│   │   │   ├── Header.tsx       # 顶部导航
│   │   │   ├── Sidebar.tsx      # 左侧导航
│   │   │   └── PageContainer.tsx
│   │   │
│   │   ├── agent/               # Agent 相关
│   │   │   ├── list/             # Agent 列表
│   │   │   │   ├── AgentListPage.tsx
│   │   │   │   ├── AgentCard.tsx
│   │   │   │   ├── AgentCardSkeleton.tsx
│   │   │   │   └── EmptyAgentState.tsx
│   │   │   │
│   │   │   ├── detail/           # Agent 详情
│   │   │   │   ├── AgentDetailPage.tsx
│   │   │   │   └── AgentHeader.tsx
│   │   │   │
│   │   │   ├── brain/            # Brain/Profile 配置
│   │   │   │   ├── BrainTab.tsx
│   │   │   │   ├── IntegrationsSection.tsx
│   │   │   │   ├── KnowledgeSection.tsx
│   │   │   │   ├── MemorySection.tsx
│   │   │   │   ├── IdentityForm.tsx
│   │   │   │   ├── SoulForm.tsx
│   │   │   │   ├── UserContextForm.tsx
│   │   │   │   └── ProfilePreview.tsx
│   │   │   │
│   │   │   └── chat/             # Chat 对话
│   │   │       ├── ChatPage.tsx
│   │   │       ├── ChatContainer.tsx
│   │   │       ├── MessageList.tsx
│   │   │       ├── MessageBubble.tsx
│   │   │       ├── ChatInput.tsx
│   │   │       ├── MarkdownRenderer.tsx
│   │   │       └── ToolCallBubble.tsx
│   │   │
│   │   ├── tasks/                # Tasks 相关
│   │   │   ├── TasksPage.tsx
│   │   │   ├── TaskCard.tsx
│   │   │   ├── TaskForm.tsx
│   │   │   ├── CronPicker.tsx
│   │   │   └── TaskRunHistory.tsx
│   │   │
│   │   ├── files/                # Files 相关
│   │   │   ├── FilesPage.tsx
│   │   │   ├── FileList.tsx
│   │   │   └── FileUploadZone.tsx
│   │   │
│   │   ├── settings/             # Settings 相关
│   │   │   ├── SettingsPage.tsx
│   │   │   ├── SecretsSection.tsx
│   │   │   └── ChannelSection.tsx
│   │   │
│   │   ├── connector/            # Connector 相关
│   │   │   ├── ConnectorWizard.tsx
│   │   │   ├── ConnectorList.tsx
│   │   │   └── ConnectorOAuthButton.tsx
│   │   │
│   │   └── forms/               # 表单组件
│   │       ├── Form.tsx
│   │       ├── FormField.tsx
│   │       └── index.ts
│   │
│   ├── features/                # 功能页面
│   │   └── agent/
│   │       ├── AgentListPage.tsx
│   │       ├── AgentDetailPage.tsx
│   │       └── AgentChatPage.tsx
│   │
│   ├── hooks/                   # 自定义 Hooks
│   │   ├── useAgent.ts
│   │   ├── useChat.ts
│   │   ├── useTask.ts
│   │   ├── useConnector.ts
│   │   └── useAuth.ts
│   │
│   ├── stores/                  # Zustand 状态管理
│   │   ├── agentStore.ts
│   │   ├── chatStore.ts
│   │   ├── taskStore.ts
│   │   ├── workspaceStore.ts
│   │   └── uiStore.ts
│   │
│   └── lib/                    # 核心库
│       ├── llm/                 # LLM 网关
│       │   ├── types.ts         # 类型定义
│       │   ├── gateway.ts       # 统一入口
│       │   ├── index.ts
│       │   └── providers/
│       │       ├── kimi.ts      # Kimi Provider
│       │       ├── minimax.ts   # MiniMax Provider
│       │       ├── anthropic.ts  # Claude Provider
│       │       ├── openai.ts    # GPT Provider
│       │       └── google.ts    # Gemini Provider
│       │
│       ├── supabase/            # Supabase 客户端
│       │   ├── client.ts
│       │   ├── agents.ts
│       │   ├── connectors.ts
│       │   ├── tasks.ts
│       │   ├── memories.ts
│       │   └── types.ts
│       │
│       ├── prompt/              # Prompt 拼装
│       │   ├── buildSystemPrompt.ts
│       │   ├── summaryPrompt.ts
│       │   └── index.ts
│       │
│       └── rag/                 # RAG 管道
│           ├── retrieve.ts
│           ├── ingest.ts
│           ├── chunk.ts
│           └── index.ts
│
├── # ===================
│   # 后端代码 (Supabase)
│   # ===================
│
├── supabase/                    # Supabase 配置
│   ├── functions/               # Edge Functions
│   │   ├── llm-chat/           # LLM 对话入口
│   │   │   └── index.ts
│   │   ├── tool-call/          # Tool 调用
│   │   │   └── index.ts
│   │   ├── rag-ingest/          # RAG 摄入
│   │   │   └── index.ts
│   │   ├── rag-retrieve/        # RAG 检索
│   │   │   └── index.ts
│   │   ├── task-runner/         # Task 执行
│   │   │   └── index.ts
│   │   └── webhook/             # Webhook 接收
│   │       ├── feishu.ts
│   │       └── index.ts
│   │
│   ├── migrations/              # 数据库迁移
│   │   ├── 001_initial_schema.sql
│   │   └── 002_enable_rls.sql
│   │
│   └── config/                  # 配置文件
│       ├── auth.config.ts
│       └── database.schema.ts
│
├── # ===================
│   # 配置文件
│   # ===================
│
├── package.json                 # 前端依赖
├── vite.config.ts              # Vite 配置
├── tsconfig.json               # TS 配置
├── tailwind.config.js          # Tailwind 配置
├── postcss.config.js           # PostCSS 配置
├── index.html                  # HTML 入口
│
├── .env.example                # 环境变量示例
├── .env.local                  # 本地环境变量 (不提交)
│
├── # ===================
│   # 文档
│   # ===================
│
├── CLAUDE.md                   # 项目主指南
├── STATUS.md                   # 项目状态
│
└── .claude/
    ├── tasks/                  # 开发任务
    │   ├── DEVELOPMENT-PLAN.md
    │   ├── FRONTEND-PLAN.md
    │   ├── FRONTEND-BASE44-UI.md
    │   ├── phase-1.md
    │   ├── phase-2.md
    │   ├── connector-feishu.md
    │   ├── llm-domestic.md
    │   ├── expert-agent.md
    │   └── agent-orchestration.md
    │
    ├── ARCHITECTURE.md
    ├── DATABASE.md
    ├── FEATURES.md
    ├── LLM_GATEWAY.md
    ├── CONNECTORS.md
    ├── RAG.md
    ├── TASKS.md
    └── DECISIONS.md
```

---

## 前后端通信

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   前端      │     │  Supabase   │     │   外部 API   │
│  (React)    │────▶│   Client    │────▶│  (LLM/飞书)  │
│             │     │             │     │              │
│  useAgent   │     │ Edge Funcs  │     │  Kimi API   │
│  useChat    │────▶│   (Deno)    │────▶│  MiniMax    │
│  useTask    │     │             │     │  Feishu API │
└─────────────┘     └─────────────┘     └─────────────┘
                          │
                          ▼
                   ┌─────────────┐
                   │ PostgreSQL   │
                   │ + pgvector  │
                   │ + Vault     │
                   │ + Storage   │
                   │ + Auth      │
                   └─────────────┘
```

---

## 启动开发

### 1. 安装前端依赖

```bash
cd /root/agent-platform
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env.local
# 填写 API Keys
```

### 3. 启动前端开发服务器

```bash
npm run dev
```

### 4. 部署 Edge Functions

```bash
supabase functions deploy llm-chat
supabase functions deploy tool-call
# ...
```
