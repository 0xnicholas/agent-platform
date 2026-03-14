# 开发任务索引

> Agent Platform 开发任务总览

## 任务文件

| 文件 | 内容 | 任务数 |
|------|------|--------|
| [DEVELOPMENT-PLAN.md](./DEVELOPMENT-PLAN.md) | 完整开发计划 | 135 |
| [phase-1.md](./phase-1.md) | Phase 1: Agent 基础 | 28 |
| [phase-2.md](./phase-2.md) | Phase 2: Connector 体系 | 26 |
| [phase-3.md](./phase-3.md) | Phase 3: Tasks + Automation | 17 |
| [phase-4.md](./phase-4.md) | Phase 4: RAG + Memory | 16 |
| [phase-5.md](./phase-5.md) | Phase 5: 发布与市场 | 17 |

## 扩展任务文件

| 文件 | 内容 |
|------|------|
| [connector-feishu.md](./connector-feishu.md) | Feishu Connector 详细规范 |
| [llm-domestic.md](./llm-domestic.md) | 国产 LLM (Kimi/MiniMax) |
| [expert-agent.md](./expert-agent.md) | Expert Agent 训练 |
| [agent-orchestration.md](./agent-orchestration.md) | Agent 编排 |

## 快速导航

### Phase 1: Agent 基础
- Supabase 初始化 (T101-T109)
- LLM 网关 (T111-T120) **← 国产模型优先**
- Profile 配置 (T131-T139)
- 对话界面 (T141-T149)

### Phase 2: Connector 体系
- Connector 基础设施 (T201-T206)
- OAuth 集成 (T211-T217) **← 飞书优先**
- Function Calling (T221-T229) **← 飞书消息/机器人/文档**

### Phase 3: Tasks + Automation
- Task 基础设施 (T301-T305)
- 调度系统 (T311-T316)
- 事件触发 (T321-T324)
- ExecutionSummary (T331-T334)

### Phase 4: RAG + Memory
- RAG 基础设施 (T401-T405)
- 向量化管道 (T411-T415)
- 检索管道 (T421-T424)
- Memory (T431-T435)

### Phase 5: Expert Agent
- Expert Profile (E01-E04)
- 知识训练 (E05-E08)
- 工作流 (E09-E12)
- 训练优化 (E13-E16)

### Phase 6: Agent 编排
- 基础编排 (O01-O04)
- 编排引擎 (O05-O08)
- 高级功能 (O09-O12)
- 可视化 (O13-O15)

### Phase 7: 发布与市场
- 发布流程 (T501-T505)
- 市场功能 (T511-T515)
- 订阅计费 (T521-T525)

---

## 使用方法

1. 开始 coding session 前，查看当前 Phase 任务文件
2. 选择要完成的任务
3. 完成后更新任务状态为 ✅
4. 重大里程碑更新 DEVELOPMENT-PLAN.md
