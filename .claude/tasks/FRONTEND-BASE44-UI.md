# 前端开发任务 - 仿照 Base44 Superagent

> 基于 Base44 Superagent 页面分析

---

## 页面结构分析

根据 Base44 文档和设计，Superagent 页面包含以下核心区域：

```
┌─────────────────────────────────────────────────────────────┐
│  Header (顶部导航)                                           │
├──────────────┬──────────────────────────────────────────────┤
│              │                                               │
│   Sidebar    │              Main Content                   │
│   (左侧导航)  │              (主内容区)                    │
│              │                                               │
│  - Agents    │  ┌─────────────────────────────────────┐   │
│  - Chat      │  │  Agent Card / Config / Chat         │   │
│  - Tasks     │  │                                     │   │
│  - Files     │  │                                     │   │
│  - Settings  │  │                                     │   │
│              │  └─────────────────────────────────────┘   │
│              │                                               │
└──────────────┴──────────────────────────────────────────────┘
```

---

## 页面与组件

### 1. 布局组件

| ID | 组件 | 说明 | 状态 |
|----|------|------|------|
| L01 | Layout | 整体布局 (Header + Sidebar + Content) | ⬜ |
| L02 | Header | 顶部导航栏 | ⬜ |
| L03 | Sidebar | 左侧导航 | ⬜ |
| L04 | PageContainer | 页面容器 | ⬜ |

### 2. Superagent 列表页

| ID | 组件 | 说明 | 状态 |
|----|------|------|------|
| S01 | AgentListPage | Agent 列表页面 | ⬜ |
| S02 | AgentCard | Agent 卡片组件 | ⬜ |
| S03 | AgentCardSkeleton | 卡片加载骨架屏 | ⬜ |
| S04 | CreateAgentButton | 创建 Agent 按钮 | ⬜ |
| S05 | EmptyAgentState | 空状态组件 | ⬜ |
| S06 | AgentCardMenu | 卡片菜单 (编辑/删除/复制) | ⬜ |

### 3. Superagent 详情/配置页

| ID | 组件 | 说明 | 状态 |
|----|------|------|------|
| C01 | AgentDetailPage | Agent 详情页面 | ⬜ |
| C02 | AgentHeader | Agent 头部 (名称/头像/状态) | ⬜ |
| C03 | TabNavigation | Tab 导航 (Brain/Chat/Tasks/Files) | ⬜ |

### 4. Brain 配置 (Profile)

| ID | 组件 | 说明 | 状态 |
|----|------|------|------|
| B01 | BrainTab | Brain 配置标签页 | ⬜ |
| B02 | IntegrationsSection | 集成服务区域 | ⬜ |
| B03 | ConnectorCard | Connector 卡片 | ⬜ |
| B04 | ConnectorList | Connector 列表 | ⬜ |
| B05 | AddConnectorButton | 添加 Connector 按钮 | ⬜ |
| B06 | KnowledgeSection | 知识库区域 | ⬜ |
| B07 | KnowledgeFileList | 知识文件列表 | ⬜ |
| B08 | UploadFileButton | 上传文件按钮 | ⬜ |
| B09 | MemorySection | 记忆区域 | ⬜ |
| B10 | SavedFactsList | 记忆列表 | ⬜ |
| B11 | IdentityForm | Identity 表单 | ⬜ |
| B12 | SoulForm | Soul 表单 | ⬜ |
| B13 | UserContextForm | User Context 表单 | ⬜ |
| B14 | ProfilePreview | Profile 预览 | ⬜ |

### 5. Chat 对话页面

| ID | 组件 | 说明 | 状态 |
|----|------|------|------|
| H01 | ChatPage | 对话页面 | ⬜ |
| H02 | ChatContainer | 对话容器 | ⬜ |
| H03 | MessageList | 消息列表 | ⬜ |
| H04 | MessageBubble | 消息气泡 | ⬜ |
| H05 | UserMessage | 用户消息 | ⬜ |
| H06 | AssistantMessage | 助手消息 | ⬜ |
| H07 | MessageLoading | 消息加载中 | ⬜ |
| H08 | MessageError | 消息错误 | ⬜ |
| H09 | ChatInput | 聊天输入框 | ⬜ |
| H10 | SendButton | 发送按钮 | ⬜ |
| H11 | VoiceInputButton | 语音输入按钮 | ⬜ |
| H12 | MarkdownRenderer | Markdown 渲染 | ⬜ |
| H13 | CodeBlockRenderer | 代码块渲染 | ⬜ |
| H14 | ToolCallBubble | 工具调用气泡 | ⬜ |
| H15 | ToolResultBubble | 工具结果气泡 | ⬜ |

### 6. Tasks 页面

| ID | 组件 | 说明 | 状态 |
|----|------|------|------|
| T01 | TasksPage | Tasks 页面 | ⬜ |
| T02 | TaskList | Task 列表 | ⬜ |
| T03 | TaskCard | Task 卡片 | ⬜ |
| T04 | TaskCardSkeleton | Task 卡片骨架屏 | ⬜ |
| T05 | CreateTaskButton | 创建 Task 按钮 | ⬜ |
| T06 | TaskForm | Task 表单 | ⬜ |
| T07 | CronPicker | Cron 表达式选择器 | ⬜ |
| T08 | EventTriggerConfig | 事件触发配置 | ⬜ |
| T09 | TaskRunHistory | 任务运行历史 | ⬜ |
| T10 | TaskRunItem | 运行记录项 | ⬜ |
| T11 | ExecutionSummaryCard | 执行摘要卡片 | ⬜ |

### 7. Files 页面

| ID | 组件 | 说明 | 状态 |
|----|------|------|------|
| F01 | FilesPage | Files 页面 | ⬜ |
| F02 | FileList | 文件列表 | ⬜ |
| F03 | FileItem | 文件项 | ⬜ |
| F04 | FileUploadZone | 文件上传区域 | ⬜ |
| F05 | FilePreview | 文件预览 | ⬜ |

### 8. Settings 设置页

| ID | 组件 | 说明 | 状态 |
|----|------|------|------|
| G01 | SettingsPage | Settings 页面 | ⬜ |
| G02 | SecretsSection | 密钥管理区域 | ⬜ |
| G03 | ApiKeySection | API Key 区域 | ⬜ |
| G04 | ChannelSection | 渠道配置 (WhatsApp/Telegram) | ⬜ |
| G05 | WhatsAppConnect | WhatsApp 连接 | ⬜ |
| G06 | TelegramConnect | Telegram 连接 | ⬜ |

### 9. Connector 管理

| ID | 组件 | 说明 | 状态 |
|----|------|------|------|
| K01 | ConnectorWizard | Connector 向导 | ⬜ |
| K02 | ConnectorOAuthButton | OAuth 授权按钮 | ⬜ |
| K03 | ConnectorStatus | 连接状态 | ⬜ |
| K04 | ConnectorDisconnect | 断开连接 | ⬜ |
| K05 | ConnectorReconnect | 重新连接 | ⬜ |

### 10. 通用组件

| ID | 组件 | 说明 | 状态 |
|----|------|------|------|
| U01 | Modal | 模态框 | ⬜ |
| U02 | Drawer | 抽屉 | ⬜ |
| U03 | DropdownMenu | 下拉菜单 | ⬜ |
| U04 | Select | 选择器 | ⬜ |
| U05 | Textarea | 文本域 | ⬜ |
| U06 | Switch | 开关 | ⬜ |
| U07 | Badge | 徽章 | ⬜ |
| U08 | Avatar | 头像 | ⬜ |
| U09 | Tooltip | 提示 | ⬜ |
| U10 | Toast | 通知 | ⬜ |
| U11 | LoadingSpinner | 加载 spinner | ⬜ |
| U12 | Skeleton | 骨架屏 | ⬜ |
| U13 | Divider | 分割线 | ⬜ |
| U14 | Tabs | 标签页 | ⬜ |
| U15 | ScrollArea | 滚动区域 | ⬜ |
| U16 | ScrollToTop | 滚动到顶部 | ⬜ |

### 11. 表单组件

| ID | 组件 | 说明 | 状态 |
|----|------|------|------|
| F001 | Form | 表单容器 | ⬜ |
| F002 | FormField | 表单字段 | ⬜ |
| F003 | FormLabel | 表单标签 | ⬜ |
| F004 | FormError | 表单错误 | ⬜ |
| F005 | FormHelper | 表单帮助文本 | ⬜ |

### 12. 响应式组件

| ID | 组件 | 说明 | 状态 |
|----|------|------|------|
| R01 | MobileSidebar | 移动端侧边栏 | ⬜ |
| R02 | MobileNav | 移动端导航 | ⬜ |
| R03 | ResponsiveGrid | 响应式网格 | ⬜ |

---

## 任务统计

| 类别 | 组件数 |
|------|--------|
| 布局组件 | 4 |
| Agent 列表 | 6 |
| Agent 详情 | 3 |
| Brain 配置 | 14 |
| Chat 对话 | 15 |
| Tasks | 11 |
| Files | 5 |
| Settings | 6 |
| Connector | 5 |
| 通用组件 | 16 |
| 表单组件 | 5 |
| 响应式 | 3 |
| **总计** | **93** |

---

## 开发顺序

### 第一批 (核心功能)

1. **布局** → L01-L04
2. **通用组件** → U01-U06
3. **Agent 列表** → S01-S06
4. **Chat 对话** → H01-H15

### 第二批 (配置功能)

5. **Brain 配置** → B01-B14
6. **Connector** → K01-K05
7. **Tasks** → T01-T11

### 第三批 (辅助功能)

8. **Files** → F01-F05
9. **Settings** → G01-G06
10. **表单** → F001-F005
11. **响应式** → R01-R03

---

## 文件结构建议

```
src/
├── components/
│   ├── layout/           # 布局组件
│   │   ├── Layout.tsx
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── PageContainer.tsx
│   │
│   ├── agent/            # Agent 相关
│   │   ├── list/         # Agent 列表
│   │   ├── detail/       # Agent 详情
│   │   ├── brain/       # Brain 配置
│   │   └── chat/         # Chat 对话
│   │
│   ├── tasks/            # Tasks 相关
│   ├── files/            # Files 相关
│   ├── settings/         # Settings 相关
│   ├── connector/        # Connector 相关
│   ├── ui/               # 通用 UI (已有部分)
│   └── forms/            # 表单组件
│
├── features/             # 功能模块
│   └── agent/
│       ├── AgentListPage.tsx
│       ├── AgentDetailPage.tsx
│       └── AgentChatPage.tsx
│
├── hooks/                # 自定义 hooks
│   ├── useAgent.ts
│   ├── useChat.ts
│   └── useTask.ts
│
└── stores/               # Zustand stores
    ├── agentStore.ts
    └── chatStore.ts
```

---

## UI 设计参考

### 颜色系统

```css
/* 主色 */
--color-primary-50: #f0f9ff;
--color-primary-500: #0ea5e9;
--color-primary-600: #0284c7;

/* 背景 */
--color-bg-primary: #ffffff;
--color-bg-secondary: #f9fafb;
--color-bg-tertiary: #f3f4f6;

/* 边框 */
--color-border: #e5e7eb;
--color-border-hover: #d1d5db;

/* 文字 */
--color-text-primary: #111827;
--color-text-secondary: #6b7280;
--color-text-tertiary: #9ca3af;
```

### 间距系统

```css
--spacing-xs: 0.25rem;   /* 4px */
--spacing-sm: 0.5rem;    /* 8px */
--spacing-md: 1rem;      /* 16px */
--spacing-lg: 1.5rem;    /* 24px */
--spacing-xl: 2rem;      /* 32px */
```

### 圆角

```css
--radius-sm: 0.375rem;   /* 6px */
--radius-md: 0.5rem;     /* 8px */
--radius-lg: 0.75rem;   /* 12px */
--radius-xl: 1rem;       /* 16px */
```
