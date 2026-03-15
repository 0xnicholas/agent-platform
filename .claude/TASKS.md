# TASKS.md — 开发任务与进度

## 当前阶段

**Phase 5：发布与市场**（进行中）

---

## 待完成任务

### Phase 1：Agent 基础

- [x] Supabase 项目初始化
  - [x] 创建所有表（参考 DATABASE.md）
  - [x] 配置 RLS 策略
  - [x] 开启 pgvector 扩展
  - [x] 配置 Supabase Vault（用于 Connector credentials）
- [x] LLM 网关实现
  - [x] 统一 LLMRequest / LLMResponse 接口
  - [x] Claude（claude-sonnet-4-6）接入
  - [x] OpenAI（gpt-4o）接入
  - [x] Gemini（gemini-2.0-flash）接入
  - [x] Streaming 支持
  - [x] Token 用量记录到数据库
- [x] Profile 配置 UI
  - [x] Identity / Principles / Tone 编辑器
  - [x] Knowledge Files 上传
  - [x] User Context 编辑
  - [x] System prompt 实时预览
- [x] 基础对话界面
  - [x] Streaming 消息渲染
  - [x] 对话历史持久化
  - [x] 工具调用结果展示

### Phase 2：Connector 体系

- [x] Connector 抽象接口设计
- [x] Gmail Connector 接入
- [x] Slack OAuth 接入
- [x] Function calling 执行管道
- [x] Connector 管理 UI

### Phase 3：Tasks + Automation

- [x] Task 调度替代方案 (Edge Function)
- [ ] 事件触发机制
- [ ] ExecutionSummary 结构化生成
- [ ] Task 历史与监控 UI

### Phase 4：RAG + Memory

- [x] 文件分块与向量化管道
- [x] pgvector 相似度检索
- [ ] Memory 持久化与注入逻辑

### Phase 5：发布与市场

- [x] Agent 发布流程
- [x] 公开 Agent 页面
- [x] Agent 市场 UI
- [ ] 订阅与计费

---

## 已完成

_（完成后从上方移至此处，附完成日期）_

---

## 已知问题

_（开发中发现的问题记录在此，修复后删除）_

---

## 每次 coding session 开始前更新

1. 更新"当前阶段"
2. 勾选本次要完成的任务
3. 把上次遗留的已知问题贴给 Claude
