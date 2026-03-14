# Agent Platform 开发计划

> 创建日期: 2026-03-13
> 版本: v2.0 (国产化 + 飞书 + Expert Agent)
> 目标: 完成类 Base44 的 Agent 创建平台

---

## 目录

1. [Phase 1: Agent 基础](#phase-1-agent-基础)
2. [Phase 2: Connector 体系](#phase-2-connector-体系)
3. [Phase 3: Tasks + Automation](#phase-3-tasks--automation)
4. [Phase 4: RAG + Memory](#phase-4-rag--memory)
5. [Phase 5: Expert Agent 训练](#phase-5-expert-agent-训练)
6. [Phase 6: Agent 编排](#phase-6-agent-编排)
7. [Phase 7: 发布与市场](#phase-7-发布与市场)

---

## Phase 1: Agent 基础

**目标**: 完成 Agent 的核心创建、配置和对话功能

### 1.1 Supabase 项目初始化

| 任务 ID | 任务名称 | 描述 | 依赖 |
|---------|----------|------|------|
| T101 | 创建 workspaces 表 | 工作区表，包含 plan 字段 | - |
| T102 | 创建 workspace_members 表 | 工作区成员关联表 | T101 |
| T103 | 创建 agents 表 | Agent 核心实体 | T102 |
| T104 | 创建 conversations 表 | 对话历史表 | T103 |
| T105 | 创建 messages 表 | 消息表（可选，或用 JSONB） | T104 |
| T106 | 配置 RLS 策略 | 所有表的行级安全策略 | T101-T105 |
| T107 | 开启 pgvector 扩展 | RAG 向量检索需要 | - |
| T108 | 配置 Supabase Vault | 存储 Connector credentials | - |
| T109 | 创建 token_usage 表 | Token 用量记录 | T103 |

### 1.2 LLM 网关实现

| 任务 ID | 任务名称 | 描述 | 依赖 |
|---------|----------|------|------|
| T111 | 定义 LLM 类型 | Message/ToolDefinition/ModelConfig | - |
| T112 | 创建 LLM 错误类型 | LLMError 及错误码 | T111 |
| T113 | **Kimi Provider** | Kimi Turbo/Pro/Max 接入 | T111 |
| T114 | **MiniMax Provider** | abab6.5s/6.5g/6.5 接入 | T111 |
| T115 | OpenAI Provider | gpt-4o 接入 | T111 |
| T116 | 创建 LLM Gateway 入口 | callLLM/streamLLM 统一接口 | T113-T115 |
| T117 | 实现 Token 裁剪 | contextManager 上下文管理 | T116 |
| T118 | 实现 Token 用量记录 | 异步记录到数据库 | T109, T116 |
| T119 | 创建 llm-chat Edge Function | 前端调用入口 | T116 |
| T120 | 测试多模型切换 | 验证 Gateway 路由正确 | T119 |

### 1.3 Profile 配置 UI

| 任务 ID | 任务名称 | 描述 | 依赖 |
|---------|----------|------|------|
| T131 | 创建 Agent 列表页 | 展示工作区所有 Agent | T103 |
| T132 | 创建 Agent 创建/编辑页 | 基础信息编辑 | T131 |
| T133 | 实现 Identity 编辑器 | 角色设定输入框 | T132 |
| T134 | 实现 Principles 编辑器 | 行为原则输入框 | T133 |
| T135 | 实现 Tone 编辑器 | 沟通风格选择器 | T134 |
| T136 | 实现 User Context 编辑器 | 用户背景输入框 | T135 |
| T137 | 创建 Profile 预览组件 | System Prompt 实时预览 | T136 |
| T138 | 实现 Agent 头像上传 | Supabase Storage 集成 | T132 |
| T139 | 保存 Profile 到数据库 | Supabase mutate | T137 |

### 1.4 基础对话界面

| 任务 ID | 任务名称 | 描述 | 依赖 |
|---------|----------|------|------|
| T141 | 创建 Chat 页面布局 | 左侧 Agent 列表 + 右侧对话 | T131 |
| T142 | 实现消息列表组件 | 消息渲染（user/assistant） | T141 |
| T143 | 实现消息输入框 | 发送消息 UI | T142 |
| T144 | 实现 Streaming 渲染 | SSE 流式响应展示 | T144 |
| T145 | 实现对话历史加载 | 从数据库读取历史 | T143 |
| T146 | 保存对话到数据库 | 每次交互持久化 | T145 |
| T147 | 实现 Markdown 渲染 | 支持代码块等格式 | T144 |
| T148 | 实现 Loading 状态 | 流式响应期间的 UI | T144 |
| T149 | 实现错误处理 UI | API 错误展示 | T147 |

### 1.5 Phase 1 里程碑任务

| 任务 ID | 任务名称 | 描述 | 依赖 |
|---------|----------|------|------|
| T1XX | 端到端测试 | 创建一个 Agent 并对话 | T149 |

---

## Phase 2: Connector 体系

**目标**: 完成外部服务集成（OAuth + Function Calling）

### 2.1 Connector 基础设施

| 任务 ID | 任务名称 | 描述 | 依赖 |
|---------|----------|------|------|
| T201 | 创建 connectors 表 | Connector 配置存储 | T103 |
| T202 | 定义 Connector 接口 | TypeScript 类型定义 | - |
| T203 | 创建 Connector 注册表 | 内存中的 connector 映射 | T202 |
| T204 | 实现 Tool 定义解析器 | JSON Schema → LLM Tool | T202 |
| T205 | 创建 Connector 管理 UI | 连接器列表页 | T201 |
| T206 | 实现 Connector 添加向导 | 添加新 Connector 流程 | T205 |

### 2.2 OAuth 集成

| 任务 ID | 任务名称 | 描述 | 依赖 |
|---------|----------|------|------|
| T211 | 实现 OAuth 回调处理 | Supabase Auth 回调 | T108 |
| T212 | **Feishu OAuth 接入** | 飞书授权 + Token 刷新 | T211 |
| T213 | Slack OAuth 接入 | 授权 + Token 刷新 | T211 |
| T214 | GitHub OAuth 接入 | 授权 + Token 刷新 | T211 |
| T215 | Notion OAuth 接入 | 授权 + Token 刷新 | T211 |
| T216 | 实现 Token 存储 | Vault 加密存储 | T108, T212-T215 |
| T217 | 实现 Token 刷新逻辑 | 自动刷新过期 Token | T216 |

### 2.3 Function Calling

| 任务 ID | 任务名称 | 描述 | 依赖 |
|---------|----------|------|------|
| T221 | 创建 tool-call Edge Function | 接收前端 tool_call 请求 | T119 |
| T222 | **Feishu 消息 Tools** | send/read/search 消息 | T212 |
| T223 | **Feishu 机器人 Tools** | 配置/管理机器人 | T222 |
| T224 | **Feishu 文档 Tools** | read/create/update 文档 | T222 |
| T225 | 实现 Slack Tools | read_messages/send_message | T213 |
| T226 | 实现 GitHub Tools | list_issues/create_issue | T214 |
| T227 | 实现 Notion Tools | read_page/create_page | T215 |
| T228 | 实现 Custom Connector | 用户自定义 API | T203 |
| T229 | Tool 结果返回处理 | 流式返回 tool_result | T221 |

### 2.4 Connector 管理

| 任务 ID | 任务名称 | 描述 | 依赖 |
|---------|----------|------|------|
| T231 | Connector 列表页 | 查看已连接的 Connectors | T205 |
| T232 | Connector 详情页 | 查看配置和状态 | T231 |
| T233 | Connector 断开/重连 | 重新授权流程 | T232 |
| T234 | Connector 日志查看 | 查看调用历史 | T233 |

### 2.5 Phase 2 里程碑任务

| 任务 ID | 任务名称 | 描述 | 依赖 |
|---------|----------|------|------|
| T2XX | 端到端 Connector 测试 | Gmail 读取 + 发送测试 | T234 |

---

## Phase 3: Tasks + Automation

**目标**: 完成定时任务和事件触发自动化

### 3.1 Task 基础设施

| 任务 ID | 任务名称 | 描述 | 依赖 |
|---------|----------|------|------|
| T301 | 创建 tasks 表 | Task 配置存储 | T103 |
| T302 | 创建 task_runs 表 | Task 执行历史 | T301 |
| T303 | 定义 Trigger 类型 | CronTrigger/EventTrigger | - |
| T304 | 创建 Tasks 列表页 | 查看所有 Tasks | T301 |
| T305 | 创建 Task 创建/编辑 UI | 配置触发条件和 prompt | T304 |

### 3.2 调度系统

| 任务 ID | 任务名称 | 描述 | 依赖 |
|---------|----------|------|------|
| T311 | 配置 pg_cron | Supabase 定时任务 | - |
| T312 | 创建 task-runner Edge Function | 定时触发执行入口 | T301 |
| T313 | 实现 Cron 解析 | 解析 cron 表达式 | T303 |
| T314 | 实现 Task 执行逻辑 | 调用 LLM 执行 prompt | T312 |
| T315 | 多轮 Tool Calling 支持 | Task 中的多次工具调用 | T314 |
| T316 | Task 超时处理 | 3 分钟超时限制 | T314 |

### 3.3 事件触发

| 任务 ID | 任务名称 | 描述 | 依赖 |
|---------|----------|------|------|
| T321 | 定义事件源 | Gmail/Slack/GitHub 事件 | - |
| T322 | 实现 Webhook 接收 | 接收外部事件 | T212-T215 |
| T323 | 实现事件过滤 | 根据条件触发 Task | T322 |
| T324 | 事件触发执行 | 事件驱动调用 LLM | T323 |

### 3.4 ExecutionSummary

| 任务 ID | 任务名称 | 描述 | 依赖 |
|---------|----------|------|------|
| T331 | 定义 Summary 结构 | actions/alerts/quickLinks | - |
| T332 | 实现 Summary 生成逻辑 | LLM 提取关键信息 | T331 |
| T333 | Task 结果展示 UI | 结构化展示执行结果 | T332 |
| T334 | Task 历史查看 | 查看历史执行记录 | T302, T333 |

### 3.5 Phase 3 里程碑任务

| 任务 ID | 任务名称 | 描述 | 依赖 |
|---------|----------|------|------|
| T3XX | 端到端 Task 测试 | 定时发送邮件摘要 | T334 |

---

## Phase 4: RAG + Memory

**目标**: 完成知识库和记忆功能

### 4.1 RAG 基础设施

| 任务 ID | 任务名称 | 描述 | 依赖 |
|---------|----------|------|------|
| T401 | 创建 knowledge_files 表 | 文件元数据存储 | T103 |
| T402 | 创建 knowledge_chunks 表 | 向量数据存储 | T107 |
| T403 | 配置 Supabase Storage | 文件上传存储 | - |
| T404 | 创建文件上传组件 | 支持 PDF/Word/TXT | T403 |
| T405 | 实现文件解析 | PDF/Word 文本提取 | T404 |

### 4.2 向量化管道

| 任务 ID | 任务名称 | 描述 | 依赖 |
|---------|----------|------|------|
| T411 | 实现文本分块 | 1000 tokens 分块策略 | T402 |
| T412 | 实现 Embedding 生成 | 调用 Embedding API | T411 |
| T413 | 实现向量存储 | 存入 pgvector | T412 |
| T414 | 创建 rag-ingest Edge Function | 批量处理入口 | T413 |
| T415 | 实现增量更新 | 文件更新后重新向量化 | T414 |

### 4.3 检索管道

| 任务 ID | 任务名称 | 描述 | 依赖 |
|---------|----------|------|------|
| T421 | 实现向量检索 | 余弦相似度搜索 | T402 |
| T422 | 实现 rerank | 重排序提升准确率 | T421 |
| T423 | 实现 Context 注入 | 注入 LLM System Prompt | T422 |
| T424 | 创建 rag-retrieve 函数 | 检索入口封装 | T423 |

### 4.4 Memory

| 任务 ID | 任务名称 | 描述 | 依赖 |
|---------|----------|------|------|
| T431 | 创建 memories 表 | 记忆存储 | T103 |
| T432 | 实现 Saved Facts 管理 | 增删改查 | T431 |
| T433 | 实现 Session Summary | 会话结束后生成摘要 | T432 |
| T434 | 实现 Memory 注入 | 拼接到 System Prompt | T433 |
| T435 | Memory UI 管理 | 查看/编辑/删除记忆 | T434 |

### 4.5 Phase 4 里程碑任务

| 任务 ID | 任务名称 | 描述 | 依赖 |
|---------|----------|------|------|
| T4XX | 端到端 RAG 测试 | 上传文档 + 对话测试检索 | T435 |

---

## Phase 5: Expert Agent 训练

**目标**: 完成专家 Agent 的创建、训练和优化

### 5.1 Expert Profile

| 任务 ID | 任务名称 | 描述 | 依赖 |
|---------|----------|------|------|
| E01 | 扩展 Expert Profile 类型 | 添加领域/技能/资质 | T103 |
| E02 | 创建 Expert Profile 编辑器 | 专业化配置 UI | T139 |
| E03 | 实现领域选择器 | 预定义领域列表 | E02 |
| E04 | 实现技能标签管理 | 专业技能配置 | E03 |

### 5.2 知识训练

| 任务 ID | 任务名称 | 描述 | 依赖 |
|---------|----------|------|------|
| E05 | 训练文档上传 | 支持 PDF/Word/TXT | T404 |
| E06 | 案例库管理 | 上传/编辑案例 | E05 |
| E07 | FAQ 管理 | 常见问题配置 | E06 |
| E08 | 知识向量化 | 训练数据向量化 | E07 |

### 5.3 工作流

| 任务 ID | 任务名称 | 描述 | 依赖 |
|---------|----------|------|------|
| E09 | 定义 Workflow DSL | 工作流描述语言 | T303 |
| E10 | 创建工作流编辑器 | 可视化编排 | E09 |
| E11 | 实现决策树 | 条件分支逻辑 | E10 |
| E12 | 工作流执行引擎 | 解析执行工作流 | E11 |

### 5.4 训练优化

| 任务 ID | 任务名称 | 描述 | 依赖 |
|---------|----------|------|------|
| E13 | 测试用例生成 | 自动生成测试 | E12 |
| E14 | 效果评估 | 准确率/完整度评估 | E13 |
| E15 | 自动优化建议 | LLM 提供改进建议 | E14 |
| E16 | 人工反馈循环 | 用户评价 → 优化 | E15 |

---

## Phase 6: Agent 编排

**目标**: 完成多 Agent 协作系统

### 6.1 基础编排

| 任务 ID | 任务名称 | 描述 | 依赖 |
|---------|----------|------|------|
| O01 | 定义 AgentTeam 数据模型 | Team/Member/Config | T103 |
| O02 | 创建 Team 页面 UI | 团队管理界面 | T139 |
| O03 | 添加 Agent 到 Team | 成员管理 | O02 |
| O04 | 配置编排模式 | 选择执行策略 | O03 |

### 6.2 编排引擎

| 任务 ID | 任务名称 | 描述 | 依赖 |
|---------|----------|------|------|
| O05 | 实现 Sequential 执行器 | 串行执行 | O04 |
| O06 | 实现 Parallel 执行器 | 并行执行 | O05 |
| O07 | 实现 Hierarchical 执行器 | 层级协作 | O06 |
| O08 | 实现 Router 执行器 | 任务分发 | O07 |

### 6.3 高级功能

| 任务 ID | 任务名称 | 描述 | 依赖 |
|---------|----------|------|------|
| O09 | 实现 SharedContext | 共享内存 | O08 |
| O10 | 实现事件驱动协作 | Agent 间通信 | O09 |
| O11 | 实现结果汇总 | 多结果合并 | O10 |
| O12 | 实现错误处理 | 异常捕获重试 | O11 |

### 6.4 可视化

| 任务 ID | 任务名称 | 描述 | 依赖 |
|---------|----------|------|------|
| O13 | 工作流可视化 | 流程图展示 | O12 |
| O14 | 执行状态监控 | 实时状态 | O13 |
| O15 | 调试工具 | 问题排查 | O14 |

---

## Phase 7: 发布与市场

**目标**: 完成 Agent 发布和市场功能

### 5.1 发布流程

| 任务 ID | 任务名称 | 描述 | 依赖 |
|---------|----------|------|------|
| T501 | 实现发布状态管理 | draft/published 切换 | T103 |
| T502 | 创建公开 Agent 页面 | /a/{agent-slug} | T501 |
| T503 | 实现嵌入代码生成 | iframe/JS snippet | T502 |
| T504 | 实现 API Key 管理 | 外部调用认证 | T502 |
| T505 | 发布前校验 | 检查必填字段 | T501 |

### 5.2 市场功能

| 任务 ID | 任务名称 | 描述 | 依赖 |
|---------|----------|------|------|
| T511 | 创建市场首页 | 展示公开 Agent | T502 |
| T512 | 实现 Agent 搜索 | 关键词搜索 | T511 |
| T513 | 实现 Agent 分类 | 按标签/类型筛选 | T512 |
| T514 | 实现 Agent 详情页 | 详细介绍页面 | T513 |
| T515 | 实现 Agent 评分 | 用户评价功能 | T514 |

### 5.3 订阅计费

| 任务 ID | 任务名称 | 描述 | 依赖 |
|---------|----------|------|------|
| T521 | 定义计划配额 | Free/Pro/Enterprise | - |
| T522 | 实现用量统计 | Token/Agent/Connector 计数 | T109 |
| T523 | 实现配额检查 | API 调用前校验 | T522 |
| T524 | 创建订阅管理 UI | 升级/降级/取消 | T523 |
| T525 | 集成支付网关 | Stripe 接入 | T524 |

### 5.6 Phase 5 里程碑任务

| 任务 ID | 任务名称 | 描述 | 依赖 |
|---------|----------|------|------|
| T5XX | 端到端发布测试 | 发布 + 市场展示 + 调用 | T525 |

---

## 任务统计

| Phase | 任务数 | 说明 |
|-------|--------|------|
| Phase 1 | 28 | Agent 基础功能（含国产 LLM） |
| Phase 2 | 26 | Connector 体系（含飞书） |
| Phase 3 | 17 | Tasks 自动化 |
| Phase 4 | 16 | RAG + Memory |
| Phase 5 | 16 | Expert Agent 训练 |
| Phase 6 | 15 | Agent 编排 |
| Phase 7 | 17 | 发布与市场 |
| **总计** | **135** | |

---

## 开发优先级

### 高优先级 (P0)

1. T101-T109 - Supabase 初始化
2. T111-T120 - LLM Gateway（国产模型优先）
3. T131-T149 - Profile + Chat UI
4. T201-T234 - Connector 体系（飞书优先）
5. T301-T334 - Tasks

### 中优先级 (P1)

1. E01-E16 - Expert Agent 训练
2. O01-O15 - Agent 编排
3. T401-T435 - RAG + Memory

### 低优先级 (P2)

1. T501-T525 - 发布与市场

---

## 后续

每次 coding session 开始前：
1. 从 `.claude/tasks/phase-X.md` 选择任务
2. 更新 `TASKS.md` 的当前阶段
3. 记录已知问题

---
