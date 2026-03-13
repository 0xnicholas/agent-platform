# FEATURES.md — 功能规格文档

## Profile（Agent 身份配置）

Profile 是 Agent 的核心配置模块，最终被拼装进 System Prompt。

### 字段定义

| 字段 | 类型 | 说明 | 是否必填 |
|---|---|---|---|
| `identity` | string | 角色设定，描述 agent 是谁、做什么 | 是 |
| `principles` | string | 行为原则，决策边界和约束 | 否 |
| `tone` | string | 沟通风格（正式/活泼/简洁等） | 否 |
| `userContext` | string | 服务对象背景（用户是谁、所在行业等） | 否 |
| `knowledgeFiles` | File[] | 上传的 RAG 文档 | 否 |

### System Prompt 拼装规则

```
# 角色设定
{identity}

# 行为原则（如有）
{principles}

# 沟通风格（如有）
{tone}

# 用户背景（如有）
{userContext}

# 你记住的信息（如有）
{savedFacts}

# 相关知识（RAG 检索结果，如有）
{ragResults}

# 当前时间
{ISO 8601 时间}
```

字段缺失时跳过该段，不留空白块。

---

## Connectors

### 支持的 Connector 类型

| 类型 | 认证方式 | 暴露的 Tools |
|---|---|---|
| `gmail` | OAuth 2.0 | read_emails, send_email, search_emails, draft_email |
| `slack` | OAuth 2.0 | read_messages, send_message, list_channels |
| `github` | OAuth App | list_repos, list_issues, create_issue, list_prs |
| `notion` | OAuth 2.0 | read_page, create_page, search_pages |
| `custom` | API Key | 用户自定义（通过 JSON Schema 描述） |

### Tool 定义规范

每个 Tool 必须包含：
- `name`：snake_case 命名，全局唯一
- `description`：清晰描述功能，LLM 据此判断何时调用
- `inputSchema`：JSON Schema 格式，描述参数

### Connector 执行流程

```
LLM 决定调用 tool
  → Edge Function 拦截 tool_call
  → 从 Vault 取该 Connector 的 credentials
  → 执行实际 API 调用
  → 把结果作为 tool_result 返回给 LLM
  → LLM 继续生成响应
```

---

## Tasks

### Trigger 类型

**Cron Trigger（定时触发）**

```typescript
interface CronTrigger {
  type: 'cron'
  expression: string    // 标准 cron 表达式，如 "0 8 * * 1-5"
  timezone: string      // IANA 时区，如 "Asia/Shanghai"
}
```

常用预设：
- 每天早上 8 点：`0 8 * * *`
- 每周一早上 9 点：`0 9 * * 1`
- 每小时：`0 * * * *`

**Event Trigger（事件触发）**

```typescript
interface EventTrigger {
  type: 'event'
  source: 'gmail' | 'slack' | 'github'
  event: string         // 如 'new_email' | 'new_message' | 'new_pr'
  filter?: Record<string, unknown>  // 过滤条件
}
```

### ExecutionSummary 生成规则

Task 执行完成后，必须生成结构化摘要（禁止直接展示原始对话）：

```typescript
interface ExecutionSummary {
  status: 'success' | 'partial' | 'failed'
  duration: number      // 毫秒
  // 做了什么（人话，不是技术日志）
  actions: {
    description: string  // 如"检查了 Gmail，共 47 封新邮件"
    count?: number
  }[]
  // 需要用户关注的异常或低置信度结果
  alerts: {
    level: 'info' | 'warning' | 'error'
    message: string
  }[]
  // 快捷操作入口
  quickLinks: {
    label: string
    action: string      // 路由路径或外部 URL
  }[]
}
```

摘要由 LLM 从 raw_conversation 中提取生成，prompt 模板存放在 `src/lib/tasks/summaryPrompt.ts`。

---

## RAG 知识库

### 支持的文件类型

| 类型 | MIME | 处理方式 |
|---|---|---|
| PDF | application/pdf | pdf-parse 提取文本 |
| Word | application/vnd.openxmlformats-officedocument.wordprocessingml.document | mammoth 提取 |
| TXT | text/plain | 直接读取 |
| Markdown | text/markdown | 直接读取 |
| CSV | text/csv | 每行作为独立 chunk |

### 分块策略

- 默认 chunk 大小：1000 tokens
- 重叠：200 tokens（保留上下文连续性）
- 最小 chunk：100 tokens（过短的块丢弃）

### 检索策略

1. 用当前 user message 生成 query embedding
2. pgvector 余弦相似度检索，阈值 0.7，取 top 5
3. 注入 System Prompt 的 `# 相关知识` 段落
4. 单次最多注入 2000 tokens 的检索结果（超出则截断低分结果）

---

## Memory

### Memory 类型

**Saved Facts（持久化记忆）**

用户或 agent 主动保存的关键信息，长期保留：
- 用户姓名和偏好
- 重要的业务背景
- agent 被明确告知的规则

**Session Summary（会话摘要）**

每次对话结束后，由 LLM 生成的简短摘要，用于跨会话上下文延续。最多保留最近 10 条。

### Memory 注入规则

- Saved Facts：全量注入 System Prompt（最多 500 tokens）
- Session Summary：注入最近 3 条（最多 300 tokens）
- 总 Memory 注入上限：800 tokens

---

## Agent 发布

### 发布状态

| 状态 | 说明 |
|---|---|
| `draft` | 未发布，只有工作区成员可访问 |
| `published` | 已发布，可对外分享 |

### 发布后的访问方式

- **独立链接**：`/a/{agent-slug}`，无需登录即可对话
- **嵌入代码**：iframe 或 JS snippet，嵌入第三方网站
- **API 访问**：通过 API Key 调用（参考 CLAUDE.md）

### 发布前检查

发布时系统自动检查：
- [ ] identity 字段不为空
- [ ] 至少配置了一个 Connector 或 Knowledge File（可跳过，仅警告）
- [ ] 模型配置有效

---

## 用量与配额

| 计划 | 月 Token 额度 | Agent 数量 | Connector 数量 |
|---|---|---|---|
| Free | 100K | 3 | 2 |
| Pro | 5M | 无限 | 无限 |
| Enterprise | 自定义 | 无限 | 无限 |

超额后新的 LLM 调用返回 429 错误，前端展示升级提示。
