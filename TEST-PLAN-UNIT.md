# Agent Platform 测试计划

> 创建时间: 2026-03-14 14:23 GMT+8

## 测试策略

### 测试金字塔

```
         /\
        /  \
       / E2E \        ← 少量端到端测试 (Playwright)
      /--------\
     /   Integration \  ← 关键流程集成测试
    /----------------\
   /    Unit Tests     \ ← 大量单元测试 (Vitest)
  /--------------------\
```

### 技术栈

- **单元测试**: Vitest + React Testing Library
- **E2E 测试**: Playwright (可选)
- **覆盖率目标**: 70%+

---

## 测试文件结构

```
src/
├── __tests__/                    # 测试文件
│   ├── components/              # 组件测试
│   │   ├── Button.test.tsx
│   │   ├── Card.test.tsx
│   │   ├── Input.test.tsx
│   │   └── Modal.test.tsx
│   ├── pages/                   # 页面测试
│   │   ├── HomePage.test.tsx
│   │   ├── AgentListPage.test.tsx
│   │   └── AgentDetailPage.test.tsx
│   ├── lib/                     # 工具函数测试
│   │   ├── supabase/
│   │   │   ├── memories.test.ts
│   │   │   ├── connectors.test.ts
│   │   │   ├── tasks.test.ts
│   │   │   └── knowledgeFiles.test.ts
│   │   └── prompt/
│   │       └── buildSystemPrompt.test.ts
│   └── hooks/                   # Hook 测试
│       └── useAgent.test.ts
├── test/                        # 测试配置
│   ├── setup.ts                 # 测试环境配置
│   └── mocks/                   # Mock 数据
│       ├── supabase.ts
│       └── handlers.ts
└── vitest.config.ts             # Vitest 配置
```

---

## 单元测试用例

### 1. UI 组件

#### Button 组件
- [ ] 渲染不同 variant (primary, outline, ghost)
- [ ] 渲染不同 size (sm, md, lg)
- [ ] 点击事件触发
- [ ] disabled 状态
- [ ] loading 状态
- [ ] 图标显示

#### Input 组件
- [ ] 基本输入
- [ ] label 显示
- [ ] error 状态
- [ ] disabled 状态
- [ ] onChange 触发

#### Modal 组件
- [ ] 打开/关闭
- [ ] 标题显示
- [ ] footer 按钮
- [ ] 点击遮罩关闭
- [ ] ESC 关闭

#### Card 组件
- [ ] 基本渲染
- [ ] CardHeader 渲染
- [ ] CardContent 渲染

---

### 2. 页面组件

#### HomePage
- [ ] 已登录用户显示首页内容
- [ ] 未登录用户跳转登录页
- [ ] Create Agent 按钮存在

#### AgentListPage
- [ ] Agent 列表渲染
- [ ] Empty 状态显示
- [ ] Create Agent 按钮

#### AgentDetailPage
- [ ] Agent 信息显示
- [ ] Chat 消息列表
- [ ] 消息输入框
- [ ] 记忆/集成按钮存在

#### MemoryPage
- [ ] 记忆列表渲染
- [ ] 统计卡片显示
- [ ] 添加记忆 Modal
- [ ] 编辑记忆
- [ ] 删除记忆
- [ ] 空状态显示

#### IntegrationsPage
- [ ] 可用集成类型显示
- [ ] 已连接集成列表
- [ ] 添加集成 Modal
- [ ] 启用/禁用切换

#### TasksPage
- [ ] Task 列表渲染
- [ ] 创建 Task Modal
- [ ] Cron 表达式预设
- [ ] 运行 Task 按钮
- [ ] 删除 Task

#### FilesPage
- [ ] 文件列表渲染
- [ ] 上传按钮
- [ ] 文件类型过滤
- [ ] 删除文件

---

### 3. API / 工具函数

#### memories.ts
- [ ] getMemories - 返回记忆列表
- [ ] createMemory - 创建记忆
- [ ] updateMemory - 更新记忆
- [ ] deleteMemory - 删除记忆

#### connectors.ts
- [ ] getConnectors - 获取连接器列表
- [ ] createConnector - 创建连接器
- [ ] updateConnector - 更新连接器
- [ ] deleteConnector - 删除连接器
- [ ] toggleConnector - 启用/禁用

#### tasks.ts
- [ ] getTasks - 获取任务列表
- [ ] createTask - 创建任务
- [ ] updateTask - 更新任务
- [ ] deleteTask - 删除任务
- [ ] runTask - 运行任务
- [ ] getTaskRuns - 获取执行历史

#### knowledgeFiles.ts
- [ ] getKnowledgeFiles - 获取文件列表
- [ ] uploadKnowledgeFile - 上传文件
- [ ] deleteKnowledgeFile - 删除文件
- [ ] retryEmbeddings - 重新向量化

#### buildSystemPrompt.ts
- [ ] 基础 prompt 拼装
- [ ] 包含 identity
- [ ] 包含 principles
- [ ] 包含 knowledge
- [ ] 包含 memory

---

### 4. Hooks

#### useAgent
- [ ] 加载 Agent 数据
- [ ] 更新 Agent
- [ ] 加载状态
- [ ] 错误处理

---

## 集成测试用例

### 1. 用户流程

#### 登录流程
- [ ] 登录成功 → 跳转首页
- [ ] 登录失败 → 显示错误
- [ ] 记住登录状态

#### 创建 Agent 流程
- [ ] 填写表单 → 创建成功
- [ ] 创建后跳转详情页

#### 对话流程
- [ ] 发送消息 → 显示消息
- [ ] 流式响应（Mock）

### 2. Memory 流程
- [ ] 添加记忆 → 列表更新
- [ ] 编辑记忆 → 数据更新
- [ ] 删除记忆 → 列表移除

### 3. Integrations 流程
- [ ] 添加集成 → 列表显示
- [ ] 启用/禁用 → 状态更新

### 4. Task 流程
- [ ] 创建 Task → 列表显示
- [ ] 运行 Task → 状态更新

### 5. Files 流程
- [ ] 选择 Agent → 上传文件
- [ ] 删除文件 → 列表移除

---

## E2E 测试用例 (可选)

### 1. 完整用户流程
- [ ] 注册 → 登录 → 创建 Agent → 对话

### 2. 关键路径
- [ ] 创建 Agent → 添加记忆 → 对话
- [ ] 创建 Task → 运行 → 查看结果

---

## 测试数据 Mock

### Mock Users
```typescript
const mockUser = {
  id: 'user-1',
  email: 'demo@demo.com',
  user_metadata: { display_name: 'Demo User' }
}
```

### Mock Agents
```typescript
const mockAgent = {
  id: 'agent-1',
  name: 'Test Agent',
  description: 'Test Description',
  profile: { identity: 'AI Assistant' },
  is_published: false
}
```

### Mock Memories
```typescript
const mockMemory = {
  id: 'memory-1',
  agent_id: 'agent-1',
  type: 'fact',
  content: 'Test memory content'
}
```

---

## 运行测试

```bash
# 安装测试依赖
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom

# 运行单元测试
npm run test

# 运行测试并监听文件变化
npm run test:watch

# 生成覆盖率报告
npm run test:coverage

# 运行 E2E 测试 (需要 Playwright)
npm run test:e2e
```

---

## Vitest 配置

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
})
```

---

## 下一步

1. 安装测试依赖
2. 配置 Vitest
3. 编写组件测试
4. 编写 API 测试
5. 编写集成测试
