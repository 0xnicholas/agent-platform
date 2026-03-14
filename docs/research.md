# Agent Platform 研究笔记

> 更新日期: 2026-03-15

## 竞品分析

### 类 Base44 产品

1. **Cursor** — AI 编程助手，Code Agent 代表
2. **Windsurf** — 另一款 AI 编程工具
3. **Manus** — 通用 AI Agent
4. **Devin** — Cognition AI 的编程 Agent

### 平台型产品

1. **OpenAI Agents SDK** — OpenAI 官方 Agent 框架
2. **Anthropic Agent** — Claude Agent 能力
3. **LangChain** — Agent 开发框架

## 技术趋势

### 1. MCP (Model Context Protocol)

- Anthropic 主导的 Agent 通信标准
- 让 Agent 可以调用外部工具
- 类似之前的 Tool Use / Function Calling

### 2. Agent 编排

- 多 Agent 协作
- Agent 巢状调用
- 任务分解与执行

### 3. Memory 系统

- 短期记忆：对话上下文
- 长期记忆：用户偏好、学习
- 向量存储：知识检索

### 4. 安全与可控

- Agent 行为边界
- 权限控制
- 执行审计

## 商业模式参考

### 按模型收费

- 按 token 用量计费
- 主流定价：$3-15 / 1M tokens

### 订阅制

- Agent 数量限制
- 功能分级
- 常见：$20-100/月

### Marketplace 抽成

- Agent 交易平台
- 工具/Connector 销售
- 典型抽成：15-30%

## 待实现功能

### Phase 2 (重要)

- [ ] MCP 协议支持
- [ ] 多 Agent 编排
- [ ] Agent Marketplace

### Phase 3 (高级)

- [ ] Agent 商店
- [ ] Agent-to-Agent 通信
- [ ] 更完善的监控/审计

## 参考链接

- https://anthropic.com/claude/claude-3-5-sonnet
- https://platform.openai.com/docs/agents
- https://docs.anthropic.com/en/docs/mcp
