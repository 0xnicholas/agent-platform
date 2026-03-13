# DATABASE.md — 数据库设计文档

## 技术选型

- **数据库**：Supabase（PostgreSQL 15+）
- **向量扩展**：pgvector（用于 RAG 知识库检索）
- **密钥存储**：Supabase Vault（用于 Connector credentials）
- **调度**：pg_cron（用于 Task 定时触发）

---

## 完整 Schema

### workspaces（工作区）

```sql
create table workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid references auth.users(id) on delete cascade,
  plan text not null default 'free',  -- 'free' | 'pro' | 'enterprise'
  created_at timestamptz default now()
);

alter table workspaces enable row level security;

create policy "用户只能访问自己的工作区"
  on workspaces for all
  using (owner_id = auth.uid());
```

### workspace_members（工作区成员）

```sql
create table workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null default 'member',  -- 'owner' | 'admin' | 'member'
  created_at timestamptz default now(),
  unique(workspace_id, user_id)
);

alter table workspace_members enable row level security;

create policy "成员只能查看自己所在工作区的成员列表"
  on workspace_members for select
  using (user_id = auth.uid());
```

### agents（Agent 核心实体）

```sql
create table agents (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  name text not null,
  description text,
  -- Profile 配置（等同 Base44 Brain）
  profile jsonb not null default '{
    "identity": "",
    "principles": "",
    "tone": "",
    "userContext": ""
  }',
  -- 模型配置
  model_config jsonb not null default '{
    "model": "claude-sonnet-4-6",
    "maxTokens": 4096,
    "temperature": 0.7
  }',
  -- 发布状态
  is_published boolean default false,
  published_at timestamptz,
  -- 统计
  total_conversations int default 0,
  total_tasks_run int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table agents enable row level security;

create policy "工作区成员可以访问该工作区的 Agent"
  on agents for all
  using (
    workspace_id in (
      select workspace_id from workspace_members where user_id = auth.uid()
    )
  );
```

### connectors（Connector 配置）

```sql
create table connectors (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references agents(id) on delete cascade,
  type text not null,  -- 'gmail' | 'slack' | 'github' | 'notion' | 'custom'
  name text not null,
  -- 不存明文 credentials，存 Vault secret 的引用 ID
  vault_secret_id text,
  -- 该 Connector 暴露给 LLM 的 tools 定义
  tools jsonb not null default '[]',
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table connectors enable row level security;

create policy "通过 agent 继承访问权限"
  on connectors for all
  using (
    agent_id in (
      select id from agents where workspace_id in (
        select workspace_id from workspace_members where user_id = auth.uid()
      )
    )
  );
```

### tasks（自动化任务）

```sql
create table tasks (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references agents(id) on delete cascade,
  name text not null,
  -- 触发条件
  trigger jsonb not null,
  -- 示例 cron trigger:
  -- { "type": "cron", "expression": "0 8 * * *", "timezone": "Asia/Shanghai" }
  -- 示例 event trigger:
  -- { "type": "event", "source": "gmail", "event": "new_email", "filter": {} }
  -- 注入给 agent 的 user message
  prompt text not null,
  is_active boolean default true,
  -- 最近一次执行信息
  last_run_at timestamptz,
  last_run_status text,  -- 'success' | 'partial' | 'failed'
  last_run_summary jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table tasks enable row level security;

create policy "通过 agent 继承访问权限"
  on tasks for all
  using (
    agent_id in (
      select id from agents where workspace_id in (
        select workspace_id from workspace_members where user_id = auth.uid()
      )
    )
  );
```

### task_runs（任务执行历史）

```sql
create table task_runs (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references tasks(id) on delete cascade,
  status text not null,  -- 'success' | 'partial' | 'failed'
  -- 结构化摘要（展示给用户）
  summary jsonb,
  -- 完整对话记录（仅供 debug，不展示给用户）
  raw_conversation jsonb,
  -- token 用量
  input_tokens int default 0,
  output_tokens int default 0,
  started_at timestamptz default now(),
  finished_at timestamptz
);

alter table task_runs enable row level security;

create policy "通过 task → agent 继承访问权限"
  on task_runs for all
  using (
    task_id in (
      select id from tasks where agent_id in (
        select id from agents where workspace_id in (
          select workspace_id from workspace_members where user_id = auth.uid()
        )
      )
    )
  );
```

### conversations（对话历史）

```sql
create table conversations (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references agents(id) on delete cascade,
  -- 发起对话的用户（可以是 workspace member 或外部用户）
  user_id uuid references auth.users(id),
  -- 消息数组，每条消息结构：{ role, content, toolCalls?, createdAt }
  messages jsonb not null default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table conversations enable row level security;

create policy "用户只能访问自己的对话"
  on conversations for all
  using (user_id = auth.uid());
```

### memories（Agent 记忆）

```sql
create table memories (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references agents(id) on delete cascade,
  type text not null,  -- 'fact' | 'session_summary'
  content text not null,
  -- 来源对话（可选）
  conversation_id uuid references conversations(id),
  created_at timestamptz default now()
);

alter table memories enable row level security;

create policy "通过 agent 继承访问权限"
  on memories for all
  using (
    agent_id in (
      select id from agents where workspace_id in (
        select workspace_id from workspace_members where user_id = auth.uid()
      )
    )
  );
```

### knowledge_files（知识库文件）

```sql
create table knowledge_files (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references agents(id) on delete cascade,
  name text not null,
  -- Supabase Storage 中的路径
  storage_path text not null,
  file_size int,
  mime_type text,
  chunk_count int default 0,
  -- 'pending' | 'processing' | 'ready' | 'failed'
  embedding_status text default 'pending',
  created_at timestamptz default now()
);

alter table knowledge_files enable row level security;

create policy "通过 agent 继承访问权限"
  on knowledge_files for all
  using (
    agent_id in (
      select id from agents where workspace_id in (
        select workspace_id from workspace_members where user_id = auth.uid()
      )
    )
  );
```

### knowledge_chunks（知识库向量块）

```sql
-- 需要先开启 pgvector 扩展
create extension if not exists vector;

create table knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  file_id uuid references knowledge_files(id) on delete cascade,
  agent_id uuid references agents(id) on delete cascade,
  content text not null,
  -- 使用 1536 维（OpenAI text-embedding-3-small 或同等维度）
  embedding vector(1536),
  chunk_index int not null,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- 向量相似度索引（HNSW，适合生产环境）
create index on knowledge_chunks
  using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);

alter table knowledge_chunks enable row level security;

create policy "通过 agent 继承访问权限"
  on knowledge_chunks for select
  using (
    agent_id in (
      select id from agents where workspace_id in (
        select workspace_id from workspace_members where user_id = auth.uid()
      )
    )
  );
```

### token_usage（Token 用量记录）

```sql
create table token_usage (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  agent_id uuid references agents(id),
  -- 来源类型
  source_type text not null,  -- 'conversation' | 'task_run'
  source_id uuid,
  model text not null,
  input_tokens int not null default 0,
  output_tokens int not null default 0,
  created_at timestamptz default now()
);

alter table token_usage enable row level security;

create policy "工作区成员可查看用量"
  on token_usage for select
  using (
    workspace_id in (
      select workspace_id from workspace_members where user_id = auth.uid()
    )
  );
```

---

## 索引策略

```sql
-- 高频查询索引
create index idx_agents_workspace_id on agents(workspace_id);
create index idx_connectors_agent_id on connectors(agent_id);
create index idx_tasks_agent_id on tasks(agent_id);
create index idx_task_runs_task_id on task_runs(task_id);
create index idx_conversations_agent_id on conversations(agent_id);
create index idx_memories_agent_id on memories(agent_id);
create index idx_knowledge_files_agent_id on knowledge_files(agent_id);
create index idx_knowledge_chunks_agent_id on knowledge_chunks(agent_id);
create index idx_token_usage_workspace_id on token_usage(workspace_id);
create index idx_token_usage_created_at on token_usage(created_at);
```

---

## RAG 检索函数

```sql
-- 相似度检索函数（在 Supabase Edge Function 中调用）
create or replace function match_knowledge_chunks(
  query_embedding vector(1536),
  agent_id_filter uuid,
  match_threshold float default 0.7,
  match_count int default 5
)
returns table (
  id uuid,
  content text,
  similarity float
)
language sql stable
as $$
  select
    id,
    content,
    1 - (embedding <=> query_embedding) as similarity
  from knowledge_chunks
  where
    agent_id = agent_id_filter
    and 1 - (embedding <=> query_embedding) > match_threshold
  order by embedding <=> query_embedding
  limit match_count;
$$;
```

---

## 重要约定

- **所有表都必须开启 RLS**，禁止直接暴露无策略的表
- **Connector credentials 只存 Vault**，`connectors` 表只存 `vault_secret_id`
- **task_runs.raw_conversation** 只用于 debug，产品界面只展示 `summary`
- **knowledge_chunks** 的向量维度固定为 1536，切换 embedding 模型前需迁移数据
- **updated_at** 字段通过 trigger 自动更新，不依赖应用层
