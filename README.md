# Agent Platform

> 类 Base44 的 Agent 创建平台，让业务用户通过自然语言配置和管理 AI Agent

## 特性

- 🎯 **Agent 创建** — 通过自然语言配置 Agent 身份、能力、知识
- 💬 **对话交互** — 支持流式响应、多模型切换
- 🔌 **Connectors** — 集成飞书、Slack、GitHub、Gmail 等工具
- 📚 **知识库** — RAG 文档管理和向量检索
- 🧠 **记忆系统** — Agent 跨会话记忆
- ⚙️ **任务调度** — 定时/触发执行自动化任务
- 📊 **用量统计** — Token 消耗和费用监控
- 🎨 **Skills** — 可复用的技能模板（代码审查、客服、数据分析等）
- 🛒 **市场** — 发布和发现 Agent

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

# LLM API Keys (至少配置一个)
VITE_KIMI_API_KEY=your-kimi-api-key
VITE_MINIMAX_API_KEY=your-minimax-api-key
VITE_OPENAI_API_KEY=your-openai-api-key
VITE_ANTHROPIC_API_KEY=your-anthropic-api-key
VITE_GEMINI_API_KEY=your-gemini-api-key
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
supabase functions deploy rag-ingest
supabase functions deploy rag-retrieve
supabase functions deploy tool-call
supabase functions deploy task-scheduler
```

### 5. 数据库迁移

```bash
supabase db push
```

## 项目结构

```
src/
├── components/          # UI 组件
│   ├── ui/             # 基础组件 (Button, Input, Modal...)
│   ├── agent/          # Agent 相关组件
│   ├── chat/           # 聊天组件
│   ├── marketplace/    # 市场页面
│   └── ...
├── lib/
│   ├── hooks/          # 自定义 Hooks
│   ├── llm/            # LLM 网关和 providers
│   ├── rag/            # RAG 管道
│   ├── tools/          # 工具执行器
│   ├── connectors/     # Connector 实现
│   └── supabase/       # Supabase 客户端
├── stores/              # Zustand 状态管理
└── types/              # TypeScript 类型定义
```

## 核心概念

### Profile (身份)

Agent 的身份配置，包含：
- `identity` — 角色设定（你是谁）
- `principles` — 行为原则（怎么做）
- `tone` — 沟通风格（用什么语气）
- `userContext` — 服务对象背景

### Skills (技能)

可复用的 Agent 能力模板：
- 预置模板：代码审查、客服助手、文案撰写、数据分析
- 自定义技能：编写 prompt 定义能力
- 能力声明：Skill 可声明需要的 Connector 能力

### Connectors (连接器)

通过 OAuth 连接外部服务，提供 LLM Function Calling 工具：
- 飞书 — 消息、卡片、文档
- Slack — 消息、频道
- GitHub — 代码、Issue、PR
- Gmail — 邮件

### Tasks (任务)

定时或触发执行的任务：
- Cron 表达式定时
- Webhook 触发
- 固定间隔执行

### Marketplace (市场)

发布和发现 Agent：
- 发布 Agent 到市场
- 安装市场 Agent 到自己账号
- 付费/免费 Agent

## 开发指南

### 添加新页面

1. 在 `src/components/` 创建页面组件
2. 在 `App.tsx` 添加路由

### 添加新 Connector

1. 在 `src/lib/connectors/` 创建 Connector 实现
2. 在 `src/lib/connectors/index.ts` 导出
3. 在 `ConnectorManagePage.tsx` 添加配置

### 添加新 LLM Provider

1. 在 `src/lib/llm/providers/` 创建 provider 文件
2. 在 `gateway.ts` 注册

### 添加新 UI 组件

1. 在 `src/components/ui/` 创建组件
2. 导出到 `index.ts`

## 环境变量

| 变量 | 描述 | 必需 |
|------|------|------|
| `VITE_SUPABASE_URL` | Supabase 项目 URL | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key | ✅ |
| `VITE_KIMI_API_KEY` | Kimi API Key | 可选 |
| `VITE_MINIMAX_API_KEY` | MiniMax API Key | 可选 |
| `VITE_OPENAI_API_KEY` | OpenAI API Key | 可选 |
| `VITE_ANTHROPIC_API_KEY` | Anthropic API Key | 可选 |
| `VITE_GEMINI_API_KEY` | Google Gemini API Key | 可选 |

## 部署

### Vercel (推荐)

```bash
npm run build
vercel deploy --prod
```

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## License

MIT
