# CONNECTORS.md — Connector 集成规范

## Connector 抽象接口

所有 Connector 实现必须符合 ConnectorDefinition 接口，包含 type、name、authType、tools 和 execute 字段。credentials 通过 ConnectorCredentials 传入，支持 OAuth 的 accessToken/refreshToken 和 API Key 两种模式。

## OAuth 2.0 流程

1. 用户点击连接按钮，前端跳转 /auth/connect/{type}?agent_id={id}
2. Edge Function oauth-start 生成防 CSRF 的 state，存 Supabase（5分钟TTL），重定向到 Provider 授权页
3. 用户授权后 Provider 回调 oauth-callback，验证 state，code 换 token，credentials 存 Vault，connectors 表写入 vault_secret_id
4. 每次执行 tool 前检查 token 是否过期，过期则用 refresh_token 刷新并更新 Vault

## 支持的 Connector

- Gmail：gmail_list_emails / gmail_get_email / gmail_send_email / gmail_draft_email
- Slack：slack_list_channels / slack_read_messages / slack_send_message
- GitHub：github_list_issues / github_create_issue / github_list_prs
- Feishu:
- Custom：用户自定义 REST API，通过 JSON Schema 描述 tools

## 错误码规范

- AUTH_EXPIRED：token 过期，可重试（触发刷新）
- AUTH_REVOKED：用户撤销授权，不可重试，需重新 OAuth
- RATE_LIMITED：API 限流，可重试
- NOT_FOUND：资源不存在，不可重试
- PERMISSION_DENIED：权限不足，不可重试
- NETWORK_ERROR：网络错误，可重试

## 新增 Connector 检查清单

- 实现 ConnectorDefinition 接口
- 在 connectors/registry.ts 注册
- 配置 OAuth 参数或 API Key 验证逻辑
- 在 oauth-start / oauth-callback Edge Function 添加分支
- 所有 tool 的 description 清晰（LLM 据此判断何时调用）
- 错误映射到标准 ConnectorError
- 实现 Token 刷新逻辑（OAuth 类型必须）
