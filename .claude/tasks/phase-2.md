# Phase 2: Connector 体系

> 目标: 完成外部服务集成（OAuth + Function Calling）

## 2.1 Connector 基础设施

| ID | 任务 | 描述 | 状态 |
|----|------|------|------|
| T201 | 创建 connectors 表 | Connector 配置存储 | ⬜ |
| T202 | 定义 Connector 接口 | TypeScript 类型定义 | ⬜ |
| T203 | 创建 Connector 注册表 | 内存中的 connector 映射 | ⬜ |
| T204 | 实现 Tool 定义解析器 | JSON Schema → LLM Tool | ⬜ |
| T205 | 创建 Connector 管理 UI | 连接器列表页 | ⬜ |
| T206 | 实现 Connector 添加向导 | 添加新 Connector 流程 | ⬜ |

## 2.2 OAuth 集成

| ID | 任务 | 描述 | 状态 |
|----|------|------|------|
| T211 | 实现 OAuth 回调处理 | Supabase Auth 回调 | ⬜ |
| T212 | Gmail OAuth 接入 | 授权 + Token 刷新 | ⬜ |
| T213 | Slack OAuth 接入 | 授权 + Token 刷新 | ⬜ |
| T214 | GitHub OAuth 接入 | 授权 + Token 刷新 | ⬜ |
| T215 | Notion OAuth 接入 | 授权 + Token 刷新 | ⬜ |
| T216 | 实现 Token 存储 | Vault 加密存储 | ⬜ |
| T217 | 实现 Token 刷新逻辑 | 自动刷新过期 Token | ⬜ |

## 2.3 Function Calling

| ID | 任务 | 描述 | 状态 |
|----|------|------|------|
| T221 | 创建 tool-call Edge Function | 接收前端 tool_call 请求 | ⬜ |
| T222 | 实现 Gmail Tools | read_emails/send_email/search | ⬜ |
| T223 | 实现 Slack Tools | read_messages/send_message | ⬜ |
| T224 | 实现 GitHub Tools | list_issues/create_issue | ⬜ |
| T225 | 实现 Notion Tools | read_page/create_page | ⬜ |
| T226 | 实现 Custom Connector | 用户自定义 API | ⬜ |
| T227 | Tool 结果返回处理 | 流式返回 tool_result | ⬜ |

## 2.4 Connector 管理

| ID | 任务 | 描述 | 状态 |
|----|------|------|------|
| T231 | Connector 列表页 | 查看已连接的 Connectors | ⬜ |
| T232 | Connector 详情页 | 查看配置和状态 | ⬜ |
| T233 | Connector 断开/重连 | 重新授权流程 | ⬜ |
| T234 | Connector 日志查看 | 查看调用历史 | ⬜ |

## 里程碑

- [ ] T2XX 端到端 Connector 测试 - Gmail 读取 + 发送测试
