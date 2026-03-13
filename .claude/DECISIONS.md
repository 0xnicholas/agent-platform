# DECISIONS.md — 技术决策记录

每个决策记录：背景、选择、原因、放弃的选项。Claude 在 coding 时不应推翻这些决策。

---

## D001 · 统一为 Agent 概念，不区分 App / Automation

**背景**：类 Base44 产品通常把 App、Automation、Chatbot 分为三个独立入口。

**决策**：万物皆 Agent，所有功能统一为一种可配置的运行单元，通过"形态"区分交互方式。

**原因**：
- 降低用户心智负担，不需要判断"该建 App 还是 Agent"
- 符合行业趋势，Agent 是当前最强的产品叙事
- 底层实现一套，维护成本更低

**放弃的选项**：App + Agent 双入口（Base44 的做法），会导致概念分裂和重复建设。

---

## D002 · Profile 作为 Agent 身份配置模块的名称

**背景**：Base44 用 Brain，其他竞品用 Identity、Setup、Core 等名称。

**决策**：使用 Profile。

**原因**：
- 业务用户最熟悉，各类 SaaS 都有 Profile 概念
- 零学习成本，不需要解释
- 比 Brain 更中性，不会让用户觉得在"训练 AI"

**放弃的选项**：Brain（太 AI 味）、Blueprint（太技术味）、Persona（偏角色扮演场景）。

---

## D003 · 前端技术栈：React + Vite + TypeScript

**背景**：需要选择前端框架。

**决策**：React + Vite，严格使用 TypeScript。

**原因**：
- Vite 开发体验比 CRA 好，构建速度快
- React 生态最成熟，招人和 AI coding 辅助都更容易
- TypeScript 在 agent 产品中尤其重要，LLM 响应结构复杂，类型安全能避免大量 bug

**放弃的选项**：Next.js（SSR 对这个产品意义不大，增加复杂度）；Vue 3（生态相对小）。

---

## D004 · 后端：Supabase（不自建）

**背景**：需要选择后端方案。

**决策**：全面使用 Supabase（Auth、DB、Storage、Edge Functions、Realtime、Vault）。

**原因**：
- 一个平台解决认证、数据库、文件存储、API、实时通信
- pgvector 原生支持，不需要额外向量数据库
- Edge Functions 可直接持有 API Keys，安全边界清晰
- Vault 原生支持 secrets 管理，Connector credentials 不需要自建加密方案
- 快速迭代阶段减少运维负担

**放弃的选项**：自建 Node.js + PostgreSQL（运维成本高）；Firebase（不支持 SQL，向量搜索弱）。

---

## D005 · LLM 调用必须通过统一网关，禁止直接调用 SDK

**背景**：支持多模型，需要决定调用方式。

**决策**：所有 LLM 调用通过 `src/lib/llm/gateway.ts`，前端通过 Supabase Edge Function 代理。

**原因**：
- API Keys 不能暴露到前端，Edge Function 是唯一安全的持有位置
- 统一网关让切换模型、添加新模型、统一错误处理成为可能
- token 用量记录、配额检查逻辑只需要写一次

**放弃的选项**：前端直接调用 Anthropic/OpenAI SDK（API Key 会暴露在浏览器）。

---

## D006 · Connector credentials 存 Supabase Vault

**背景**：OAuth token 和 API Key 需要安全存储。

**决策**：credentials 只存 Supabase Vault，数据库只存 `vault_secret_id` 引用。

**原因**：
- Vault 自动加密，数据库泄露不会导致 credentials 泄露
- 符合最小权限原则，前端永远拿不到明文 credentials
- Supabase 原生支持，不需要额外集成 KMS

**放弃的选项**：加密后存数据库（自管理密钥有风险）；环境变量（不支持多用户多 connector）。

---

## D007 · Task 执行摘要与原始对话分离存储

**背景**：Task 执行后需要展示结果给用户。

**决策**：`task_runs` 表同时存 `summary`（结构化摘要）和 `raw_conversation`（完整对话），前端只展示 `summary`。

**原因**：
- 原始 LLM 对话太长、太乱，业务用户无法消费
- 结构化摘要（做了什么 / 异常告警 / 快捷入口）10 秒扫一眼即可判断是否正常
- `raw_conversation` 保留用于 debug，开发者可以从 Supabase 直接查看

**放弃的选项**：只存 raw conversation 然后前端展示（用户体验差）；只存 summary（debug 困难）。

---

## D008 · 状态管理：Zustand（不用 Redux / Context）

**背景**：需要选择前端状态管理方案。

**决策**：Zustand。

**原因**：
- API 简洁，boilerplate 极少
- 不需要 Provider 包裹，在任何地方都可以访问 store
- 对 TypeScript 支持好
- 足够轻量，这个项目不需要 Redux 的复杂性

**放弃的选项**：Redux Toolkit（过重）；React Context（性能问题，不适合高频更新的 chat 场景）；Jotai（团队熟悉度低）。

---

## D009 · 向量维度：1536

**背景**：需要选择 embedding 模型和向量维度。

**决策**：固定 1536 维，兼容 OpenAI text-embedding-3-small 和 Anthropic 的 embedding 方案。

**原因**：
- 1536 是当前主流维度，兼容性最好
- 固定维度避免后期迁移痛苦
- pgvector HNSW 索引在 1536 维下性能足够

**放弃的选项**：3072 维（存储和检索成本翻倍，精度提升有限）；动态维度（schema 复杂，不可行）。

---

## 如何添加新决策

复制以下模板：

```
## D00X · 决策标题

**背景**：为什么需要做这个决策。

**决策**：最终选择。

**原因**：
- 原因 1
- 原因 2

**放弃的选项**：其他考虑过的选项及放弃原因。
```
