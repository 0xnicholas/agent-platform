# 配置指南

> 快速配置 Agent Platform

---

## 1. 环境变量配置

### 前端环境变量

复制 `.env.example` 为 `.env.local`：

```bash
cp .env.example .env.local
```

填写以下内容：

```env
# Supabase (必需)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# LLM API Keys (必需，至少一个)
VITE_KIMI_API_KEY=your-kimi-api-key
VITE_MINIMAX_API_KEY=your-minimax-api-key
VITE_OPENAI_API_KEY=your-openai-api-key
```

### 获取 Supabase 配置

1. 登录 [Supabase](https://supabase.com)
2. 进入你的项目 → Settings → API
3. 复制 **Project URL** 和 **anon public** key

### 获取 Kimi API Key

1. 登录 [Kimi Platform](https://platform.moonshot.cn/)
2. 进入 API Keys 页面
3. 创建新的 API Key
4. 复制到环境变量

### 获取 MiniMax API Key

1. 登录 [MiniMax Platform](https://platform.minimax.chat/)
2. 进入 API Keys 页面
3. 创建新的 API Key
4. 复制到环境变量

---

## 2. Supabase 数据库初始化

### 方式一：SQL Editor

1. 登录 Supabase Dashboard
2. 进入 **SQL Editor**
3. 复制 `supabase/migrations/001_initial_schema.sql` 的内容
4. 点击 **Run** 执行

### 方式二：Supabase CLI

```bash
# 安装 Supabase CLI
npm install -g supabase

# 登录
supabase login

# 链接项目
supabase link --project-ref your-project-ref

# 执行迁移
supabase db push
```

---

## 3. Edge Functions 部署

### 部署所有 Functions

```bash
supabase functions deploy llm-chat
supabase functions deploy tool-call
# ... 其他 functions
```

### 设置环境变量

在 Supabase Dashboard → Edge Functions → 每个 function → Secrets 添加：

```
KIMI_API_KEY=your-kimi-api-key
MINIMAX_API_KEY=your-minimax-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
OPENAI_API_KEY=your-openai-api-key
GOOGLE_API_KEY=your-google-api-key
```

---

## 4. 验证配置

### 检查前端配置

```bash
npm run dev
```

打开浏览器控制台，检查是否有错误。

### 测试 LLM 调用

在浏览器中创建一个 Agent 并发送消息，检查是否能正常对话。

---

## 常见问题

### Q: 提示 "API Key not configured"

A: 确保环境变量已正确配置，重启开发服务器。

### Q: 提示 "Agent not found"

A: 确保 Supabase 数据库已正确初始化，agents 表存在。

### Q: CORS 错误

A: 检查 Supabase 的 Authentication → URL Configuration 是否正确配置。

---

## 下一步

配置完成后，可以：
1. 运行 `npm run dev` 启动前端
2. 在浏览器中创建第一个 Agent
3. 开始对话测试
