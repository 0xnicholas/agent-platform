# Phase 4: RAG + Memory

> 目标: 完成知识库和记忆功能

## 4.1 RAG 基础设施

| ID | 任务 | 描述 | 状态 |
|----|------|------|------|
| T401 | 创建 knowledge_files 表 | 文件元数据存储 | ⬜ |
| T402 | 创建 knowledge_chunks 表 | 向量数据存储 | ⬜ |
| T403 | 配置 Supabase Storage | 文件上传存储 | ⬜ |
| T404 | 创建文件上传组件 | 支持 PDF/Word/TXT | ⬜ |
| T405 | 实现文件解析 | PDF/Word 文本提取 | ⬜ |

## 4.2 向量化管道

| ID | 任务 | 描述 | 状态 |
|----|------|------|------|
| T411 | 实现文本分块 | 1000 tokens 分块策略 | ⬜ |
| T412 | 实现 Embedding 生成 | 调用 Embedding API | ⬜ |
| T413 | 实现向量存储 | 存入 pgvector | ⬜ |
| T414 | 创建 rag-ingest Edge Function | 批量处理入口 | ⬜ |
| T415 | 实现增量更新 | 文件更新后重新向量化 | ⬜ |

## 4.3 检索管道

| ID | 任务 | 描述 | 状态 |
|----|------|------|------|
| T421 | 实现向量检索 | 余弦相似度搜索 | ⬜ |
| T422 | 实现 rerank | 重排序提升准确率 | ⬜ |
| T423 | 实现 Context 注入 | 注入 LLM System Prompt | ⬜ |
| T424 | 创建 rag-retrieve 函数 | 检索入口封装 | ⬜ |

## 4.4 Memory

| ID | 任务 | 描述 | 状态 |
|----|------|------|------|
| T431 | 创建 memories 表 | 记忆存储 | ⬜ |
| T432 | 实现 Saved Facts 管理 | 增删改查 | ⬜ |
| T433 | 实现 Session Summary | 会话结束后生成摘要 | ⬜ |
| T434 | 实现 Memory 注入 | 拼接到 System Prompt | ⬜ |
| T435 | Memory UI 管理 | 查看/编辑/删除记忆 | ⬜ |

## 里程碑

- [ ] T4XX 端到端 RAG 测试 - 上传文档 + 对话测试检索
