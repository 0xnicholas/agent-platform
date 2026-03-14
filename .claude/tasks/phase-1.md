# Phase 1: Agent 基础

> 目标: 完成 Agent 的核心创建、配置和对话功能

## 1.1 Supabase 项目初始化

| ID | 任务 | 描述 | 状态 |
|----|------|------|------|
| T101 | 创建 workspaces 表 | 工作区表，包含 plan 字段 | ⬜ |
| T102 | 创建 workspace_members 表 | 工作区成员关联表 | ⬜ |
| T103 | 创建 agents 表 | Agent 核心实体 | ⬜ |
| T104 | 创建 conversations 表 | 对话历史表 | ⬜ |
| T105 | 创建 messages 表 | 消息表（可选，或用 JSONB） | ⬜ |
| T106 | 配置 RLS 策略 | 所有表的行级安全策略 | ⬜ |
| T107 | 开启 pgvector 扩展 | RAG 向量检索需要 | ⬜ |
| T108 | 配置 Supabase Vault | 存储 Connector credentials | ⬜ |
| T109 | 创建 token_usage 表 | Token 用量记录 | ⬜ |

## 1.2 LLM 网关实现

| ID | 任务 | 描述 | 状态 |
|----|------|------|------|
| T111 | 定义 LLM 类型 | Message/ToolDefinition/ModelConfig | ✅ |
| T112 | 创建 LLM 错误类型 | LLMError 及错误码 | ✅ |
| T113-K | **Kimi Provider** | Kimi Turbo/Pro 接入 | ✅ |
| T113 | ~~实现 Claude Provider~~ | claude-sonnet-4-6 接入 | ⏸️ |
| T114 | ~~实现 OpenAI Provider~~ | gpt-4o 接入 | ⏸️ |
| T115 | ~~实现 Gemini Provider~~ | gemini-2.0-flash 接入 | ⏸️ |
| T116 | 创建 LLM Gateway 入口 | callLLM/streamLLM 统一接口 | ✅ |
| T117 | 实现 Token 裁剪 | contextManager 上下文管理 | ⬜ |
| T118 | 实现 Token 用量记录 | 异步记录到数据库 | ⬜ |
| T119 | 创建 llm-chat Edge Function | 前端调用入口 | ⬜ |
| T120 | 测试多模型切换 | 验证 Gateway 路由正确 | ⬜ |

## 1.3 Profile 配置 UI

| ID | 任务 | 描述 | 状态 |
|----|------|------|------|
| T131 | 创建 Agent 列表页 | 展示工作区所有 Agent | ⬜ |
| T132 | 创建 Agent 创建/编辑页 | 基础信息编辑 | ⬜ |
| T133 | 实现 Identity 编辑器 | 角色设定输入框 | ⬜ |
| T134 | 实现 Principles 编辑器 | 行为原则输入框 | ⬜ |
| T135 | 实现 Tone 编辑器 | 沟通风格选择器 | ⬜ |
| T136 | 实现 User Context 编辑器 | 用户背景输入框 | ⬜ |
| T137 | 创建 Profile 预览组件 | System Prompt 实时预览 | ⬜ |
| T138 | 实现 Agent 头像上传 | Supabase Storage 集成 | ⬜ |
| T139 | 保存 Profile 到数据库 | Supabase mutate | ⬜ |

## 1.4 基础对话界面

| ID | 任务 | 描述 | 状态 |
|----|------|------|------|
| T141 | 创建 Chat 页面布局 | 左侧 Agent 列表 + 右侧对话 | ⬜ |
| T142 | 实现消息列表组件 | 消息渲染（user/assistant） | ⬜ |
| T143 | 实现消息输入框 | 发送消息 UI | ⬜ |
| T144 | 实现 Streaming 渲染 | SSE 流式响应展示 | ⬜ |
| T145 | 实现对话历史加载 | 从数据库读取历史 | ⬜ |
| T146 | 保存对话到数据库 | 每次交互持久化 | ⬜ |
| T147 | 实现 Markdown 渲染 | 支持代码块等格式 | ⬜ |
| T148 | 实现 Loading 状态 | 流式响应期间的 UI | ⬜ |
| T149 | 实现错误处理 UI | API 错误展示 | ⬜ |

## 里程碑

- [ ] T1XX 端到端测试 - 创建一个 Agent 并对话
