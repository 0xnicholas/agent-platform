# Agent Platform

> 类 Base44 的 Agent 创建平台，让业务用户通过自然语言配置和管理 AI Agent

## 特性

- 🎯 **Agent 创建** — 通过自然语言配置 Agent 身份、能力、知识
- 💬 **对话交互** — 支持流式响应、多模型切换
- 🔌 **Connectors** — 集成飞书、Slack、GitHub 等工具
- 📚 **知识库** — RAG 文档管理和向量检索
- 🧠 **记忆系统** — Agent 跨会话记忆
- ⚙️ **任务调度** — 定时/触发执行自动化任务
- 📊 **用量统计** — Token 消耗和费用监控

## 技术栈

- **前端**: React + TypeScript + Vite + Tailwind CSS
- **后端**: Supabase (Auth, Database, Storage, Edge Functions)
- **LLM**: Kimi, MiniMax, Claude, GPT, Gemini
- **状态**: Zustand
- **路由**: React Router v6

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env.local
```

填写以下配置：

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# LLM API Keys
VITE_KIMI_API_KEY=your-kimi-api-key
VITE_MINIMAX_API_KEY=your-minimax-api-key
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

### 4. 部署 Edge Functions

```bash
# 登录 Supabase
supabase login

# 部署 Functions
supabase functions deploy llm-chat
supabase functions deploy task-run
# ...
```

## 项目结构

```
src/
├── components/          # UI 组件
│   ├── ui/             # 基础组件 (Button, Input, Modal...)
│   ├── agent/          # Agent 相关组件
│   ├── chat/           # 聊天组件
│   └── ...
├── features/           # 功能模块
├── lib/
│   ├── llm/           # LLM 网关
│   ├── supabase/       # Supabase 客户端
│   └── prompt/         # Prompt 拼装
├── hooks/              # 自定义 Hooks
├── stores/             # Zustand 状态
└── types/              # TypeScript 类型
```

## 核心概念

### Profile

Agent 的身份配置，包含：
- `identity` — 角色设定
- `principles` — 行为原则
- `tone` — 沟通风格
- `userContext` — 服务对象背景

### Connectors

通过 OAuth 连接外部服务，注册为 LLM Function Calling 工具

### Tasks

定时或触发执行的任务，本质是自动化对话

## 开发指南

### 添加新页面

1. 在 `src/components/` 创建页面组件
2. 在 `App.tsx` 添加路由

### 添加新 Provider

1. 在 `src/lib/llm/providers/` 创建 provider 文件
2. 在 `gateway.ts` 注册

### 添加新 UI 组件

1. 在 `src/components/ui/` 创建组件
2. 导出到 `index.ts`

## License

MIT
