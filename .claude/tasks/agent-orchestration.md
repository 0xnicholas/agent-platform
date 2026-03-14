# Agent 编排

> 多 Agent 协作系统设计与实现

## 什么是 Agent 编排？

Agent 编排是指**多个 Agent 协同工作**来完成复杂任务。

### 编排模式

| 模式 | 说明 | 示例 |
|------|------|------|
| **Sequential** | 串行执行 | A → B → C |
| **Parallel** | 并行执行 | A + B + C |
| **Hierarchical** | 层级协作 | 主管 → 执行者 |
| **Router** | 路由分发 | 根据任务分配 |
| **Ensemble** | 投票/汇总 | 多个结果合并 |

---

## 架构设计

### 编排器 (Orchestrator)

```
┌─────────────────────────────────────────────────────────┐
│                    Orchestrator                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
│  │   Planner   │    │  Dispatcher │    │   Aggregator│ │
│  │  任务规划   │    │  任务分发   │    │  结果汇总   │ │
│  └─────────────┘    └─────────────┘    └─────────────┘ │
│                                                          │
└──────────────────────────┬──────────────────────────────┘
                           │
        ┌─────────────────┼─────────────────┐
        ↓                 ↓                 ↓
   ┌─────────┐       ┌─────────┐       ┌─────────┐
   │ Agent A │       │ Agent B │       │ Agent C │
   └─────────┘       └─────────┘       └─────────┘
```

### 数据流

```
1. 用户输入复杂任务
       ↓
2. Planner 分析任务，分解子任务
       ↓
3. Dispatcher 分发给合适的 Agent
       ↓
4. 各 Agent 并行/串行执行
       ↓
5. Aggregator 汇总结果
       ↓
6. 返回最终响应
```

---

## 数据模型

### AgentTeam

```typescript
interface AgentTeam {
  id: string
  name: string
  description: string
  
  // 成员
  agents: TeamMember[]
  
  // 编排配置
  orchestration: OrchestrationConfig
  
  // 共享上下文
  sharedContext: SharedContext
}
```

### TeamMember

```typescript
interface TeamMember {
  agentId: string           // 引用的 Agent
  role: 'coordinator' | 'worker' | 'specialist'
  responsibilities: string[]
  inputSchema: Record<string, unknown>   // 接收的输入
  outputSchema: Record<string, unknown>   // 输出的内容
}
```

### OrchestrationConfig

```typescript
interface OrchestrationConfig {
  mode: 'sequential' | 'parallel' | 'hierarchical' | 'router' | 'ensemble'
  
  // 串行配置
  sequence?: string[]  // agentId 顺序
  
  // 并行配置
  parallelism?: number  // 最大并行数
  
  // 层级配置
  hierarchy?: {
    rootAgentId: string
    childGroups: AgentGroup[]
  }
  
  // 路由配置
  router?: {
    rules: RouterRule[]
    defaultAgentId: string
  }
  
  // 汇总配置
  aggregator?: {
    method: 'concat' | 'vote' | 'merge' | 'llm_summary'
  }
}
```

### SharedContext

```typescript
interface SharedContext {
  // 共享内存
  memory: Record<string, unknown>
  
  // 事件总线
  events: TeamEvent[]
  
  // 状态
  state: TeamState
}
```

---

## 实现计划

### Phase 1: 基础编排

| 任务 | 说明 |
|------|------|
| O01 | 定义 AgentTeam 数据模型 |
| O02 | 创建 Team 页面 UI |
| O03 | 添加 Agent 到 Team |
| O04 | 配置编排模式 |

### Phase 2: 编排引擎

| 任务 | 说明 |
|------|------|
| O05 | 实现 Sequential 执行器 |
| O06 | 实现 Parallel 执行器 |
| O07 | 实现 Hierarchical 执行器 |
| O08 | 实现 Router 执行器 |

### Phase 3: 高级功能

| 任务 | 说明 |
|------|------|
| O09 | 实现 SharedContext |
| O10 | 实现事件驱动协作 |
| O11 | 实现结果汇总 |
| O12 | 实现错误处理和重试 |

### Phase 4: 可视化

| 任务 | 说明 |
|------|------|
| O13 | 工作流可视化 |
| O14 | 执行状态监控 |
| O15 | 调试工具 |

---

## 使用场景

### 场景 1: 客服团队

```
┌─────────────────────────────────────────┐
│         Customer Service Team            │
├─────────────────────────────────────────┤
│                                          │
│   Router (意图识别)                       │
│   ├── Sales Agent (销售咨询)              │
│   ├── Tech Support (技术支持)             │
│   └── Billing Agent (账单问题)            │
│                                          │
│   Coordinator (协调)                      │
│   └── 汇总结果，提供统一回复              │
│                                          │
└─────────────────────────────────────────┘
```

### 场景 2: 编程助手

```
┌─────────────────────────────────────────┐
│         Development Team                 │
├─────────────────────────────────────────┤
│                                          │
│   Planner (需求分析)                      │
│   ├── Code Agent (写代码)                 │
│   ├── Test Agent (写测试)                 │
│   └── Review Agent (代码审查)             │
│                                          │
└─────────────────────────────────────────┘
```

### 场景 3: 内容创作

```
┌─────────────────────────────────────────┐
│         Content Team                     │
├─────────────────────────────────────────┤
│                                          │
│   Planner (主题规划)                      │
│   ├── Research Agent (调研)               │
│   ├── Writer Agent (写作)                 │
│   └── Editor Agent (编辑)                 │
│                                          │
└─────────────────────────────────────────┘
```

---

## 与现有 Agent 的关系

```
Agent (单个) ──────> AgentTeam (多个)

单个 Agent:
- 独立的 Profile
- 独立工具
- 独立记忆

AgentTeam:
- 多个 Agent 协作
- 共享上下文
- 统一入口
```

---

## 参考

- AutoGen: https://microsoft.github.io/autogen/
- CrewAI: https://docs.crewai.com/
- LangChain Agents: https://js.langchain.com/docs/modules/agents/
