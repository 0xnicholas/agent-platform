# RAG.md — 知识库检索管道

## 整体流程

文件上传 → 存 Supabase Storage → 触发 Edge Function: rag-ingest → 文本提取 → 分块 → 向量化 → 存 knowledge_chunks → 更新 embedding_status = 'ready'

用户发消息 → 生成 query embedding → pgvector 相似度检索 → 注入 System Prompt 的「相关知识」段落

## 支持的文件类型

- TXT / Markdown：直接读取

单文件上限：20MB

## 分块策略

- 每块最大 token 数：1000
- 相邻块重叠 token 数：200（保留上下文连续性）
- 最小 chunk：100 token（低于此值丢弃）
- 分割顺序：段落 → 句子 → 合并过短块

## 向量化

- 模型：OpenAI text-embedding-3-small（1536 维）
- 批量处理：每批最多 100 个 chunks
- 失败时 embedding_status = 'failed'，支持手动重试

## 检索参数

- 相似度阈值：0.7（低于此分数丢弃）
- 最多返回：5 个 chunks
- 最大注入 token 数：2000

## 注入格式

注入到 System Prompt 的「相关知识」段落，每个 chunk 用分隔线隔开，标注来源文件名。

## 重要约定

- 向量维度固定 1536，切换 embedding 模型前必须迁移全部数据
- query embedding 和 chunk embedding 必须使用同一模型
- 文件删除时级联删除所有 knowledge_chunks（ON DELETE CASCADE）
- RAG 检索在 Edge Function 中执行，不在前端
- CSV 文件每行独立 chunk，不合并，适合结构化数据查询
