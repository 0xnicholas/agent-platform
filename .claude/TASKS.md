# TASKS.md — 开发任务与进度

## 当前阶段

**Phase 1：Agent 基础**（进行中）

---

## 待完成任务

### Phase 1：Agent 基础

- [ ] Supabase 项目初始化
  - [ ] 创建所有表（参考 DATABASE.md）
  - [ ] 配置 RLS 策略
  - [ ] 开启 pgvector 扩展
  - [ ] 配置 Supabase Vault（用于 Connector credentials）
- [ ] LLM 网关实现
  - [ ] 统一 LLMRequest / LLMResponse 接口
  - [ ] Claude（claude-sonnet-4-6）接入
  - [ ] OpenAI（gpt-4o）接入
  - [ ] Gemini（gemini-2.0-flash）接入
  - [ ] Streaming 支持
  - [ ] Token 用量记录到数据库
- [ ] Profile 配置 UI
  - [ ] Identity / Principles / Tone 编辑器
  - [ ] Knowledge Files 上传
  - [ ] User Context 编辑
  - [ ] System prompt 实时预览
- [ ] 基础对话界面
  - [ ] Streaming 消息渲染
  - [ ] 对话历史持久化
  - [ ] 工具调用结果展示

### Phase 2：Connector 体系

- [ ] Connector 抽象接口设计
- [ ] Gmail OAuth 接入
- [ ] Slack OAuth 接入
- [ ] Function calling 执行管道
- [ ] Connector 管理 UI

### Phase 3：Tasks + Automation

- [ ] Task 数据模型与调度（Supabase pg_cron）
- [ ] 事件触发机制
- [ ] ExecutionSummary 结构化生成
- [ ] Task 历史与监控 UI

### Phase 4：RAG + Memory

- [ ] 文件分块与向量化管道
- [ ] pgvector 相似度检索
- [ ] Memory 持久化与注入逻辑

### Phase 5：发布与市场

- [ ] Agent 发布流程
- [ ] 公开 Agent 页面
- [ ] Agent 市场 UI
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
