# Phase 3: Tasks + Automation

> 目标: 完成定时任务和事件触发自动化

## 3.1 Task 基础设施

| ID | 任务 | 描述 | 状态 |
|----|------|------|------|
| T301 | 创建 tasks 表 | Task 配置存储 | ⬜ |
| T302 | 创建 task_runs 表 | Task 执行历史 | ⬜ |
| T303 | 定义 Trigger 类型 | CronTrigger/EventTrigger | ⬜ |
| T304 | 创建 Tasks 列表页 | 查看所有 Tasks | ⬜ |
| T305 | 创建 Task 创建/编辑 UI | 配置触发条件和 prompt | ⬜ |

## 3.2 调度系统

| ID | 任务 | 描述 | 状态 |
|----|------|------|------|
| T311 | 配置 pg_cron | Supabase 定时任务 | ⬜ |
| T312 | 创建 task-runner Edge Function | 定时触发执行入口 | ⬜ |
| T313 | 实现 Cron 解析 | 解析 cron 表达式 | ⬜ |
| T314 | 实现 Task 执行逻辑 | 调用 LLM 执行 prompt | ⬜ |
| T315 | 多轮 Tool Calling 支持 | Task 中的多次工具调用 | ⬜ |
| T316 | Task 超时处理 | 3 分钟超时限制 | ⬜ |

## 3.3 事件触发

| ID | 任务 | 描述 | 状态 |
|----|------|------|------|
| T321 | 定义事件源 | Gmail/Slack/GitHub 事件 | ⬜ |
| T322 | 实现 Webhook 接收 | 接收外部事件 | ⬜ |
| T323 | 实现事件过滤 | 根据条件触发 Task | ⬜ |
| T324 | 事件触发执行 | 事件驱动调用 LLM | ⬜ |

## 3.4 ExecutionSummary

| ID | 任务 | 描述 | 状态 |
|----|------|------|------|
| T331 | 定义 Summary 结构 | actions/alerts/quickLinks | ⬜ |
| T332 | 实现 Summary 生成逻辑 | LLM 提取关键信息 | ⬜ |
| T333 | Task 结果展示 UI | 结构化展示执行结果 | ⬜ |
| T334 | Task 历史查看 | 查看历史执行记录 | ⬜ |

## 里程碑

- [ ] T3XX 端到端 Task 测试 - 定时发送邮件摘要
