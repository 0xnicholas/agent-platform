# Phase 2 开发计划：多 Agent 协作

## 目标
用户能创建多个 Agent，并定义它们之间的触发关系——Agent A 完成后自动触发 Agent B，A 的输出作为 B 的输入。

---

## 阶段划分

### Phase 2.1：数据层 (Database)
创建 Team 相关的数据库表和 migrations。

### Phase 2.2：API 层 (Supabase)
实现 Team CRUD Edge Functions。

### Phase 2.3：前端 API 客户端
在 `src/lib/supabase/` 下创建 teams.ts API 客户端。

### Phase 2.4：前端 UI
完善 TeamsPage，实现 Team 创建、编辑、执行功能。

### Phase 2.5：端到端集成
将 OrchestrationEngine 集成到前端，实现实际执行。

---

## 详细任务清单

### Phase 2.1：数据层
- [ ] 创建 `supabase/migrations/003_teams_schema.sql`
  - `teams` 表：id, name, description, mode, shared_context, created_at
  - `team_members` 表：id, team_id, agent_id, role, responsibilities, input_schema, output_schema, order_index
  - RLS 策略
- [ ] 在 Supabase SQL Editor 执行 migration

### Phase 2.2：API 层
- [ ] 创建 `supabase/functions/team-exec/index.ts`
  - POST / - 执行团队任务
  - 支持 5 种模式
- [ ] 创建/更新 `supabase/functions/teams/index.ts`
  - GET / - 获取团队列表
  - POST / - 创建团队
  - GET /:id - 获取团队详情
  - PUT /:id - 更新团队
  - DELETE /:id - 删除团队
  - POST /:id/members - 添加成员
  - DELETE /:id/members/:memberId - 移除成员
- [ ] 部署 Edge Functions

### Phase 2.3：前端 API 客户端
- [ ] 创建 `src/lib/supabase/teams.ts`
  - getTeams(), getTeam(), createTeam(), updateTeam(), deleteTeam()
  - addMember(), removeMember()
  - executeTeam()
- [ ] 创建 `src/types/team.ts` 类型定义

### Phase 2.4：前端 UI
- [ ] 完善 `src/components/teams/TeamsPage.tsx`
  - Team 列表（从 API 加载）
  - 创建 Team Modal
  - 编辑 Team Modal
  - 删除 Team
- [ ] 创建 `src/components/teams/TeamDetailPage.tsx`
  - 团队详情
  - 成员管理（添加/移除 Agent）
  - 角色分配（coordinator/worker/specialist）
  - 执行模式选择
- [ ] 添加路由 `/teams/:id` → TeamDetailPage

### Phase 2.5：端到端集成
- [ ] 在 TeamsPage 添加"执行"按钮
- [ ] 调用 team-exec Edge Function
- [ ] 显示执行结果
- [ ] 实现 Agent A → Agent B 链式触发（基于 sequential 模式）

---

## 验收标准

1. ✅ 用户可以在 UI 上创建 Team
2. ✅ 用户可以为 Team 添加多个 Agent
3. ✅ 用户可以设置 Agent 的角色（coordinator/worker/specialist）
4. ✅ 用户可以选择执行模式（sequential/parallel/hierarchical/router/ensemble）
5. ✅ 用户可以执行 Team 任务
6. ✅ Sequential 模式下，Agent A 的输出传递给 Agent B
7. ✅ 执行结果在 UI 上展示

---

## 文件结构预览

```
supabase/
├── migrations/
│   └── 003_teams_schema.sql      [新建]
├── functions/
│   ├── teams/
│   │   └── index.ts              [新建]
│   └── team-exec/
│       └── index.ts              [新建]

src/
├── lib/supabase/
│   ├── teams.ts                  [新建]
├── types/
│   └── team.ts                   [新建]
├── components/teams/
│   ├── TeamsPage.tsx             [完善]
│   └── TeamDetailPage.tsx        [新建]
```

---

## 预计工作量

| 阶段 | 任务数 | 预估时间 |
|------|--------|----------|
| Phase 2.1 | 2 | 15 min |
| Phase 2.2 | 2 | 30 min |
| Phase 2.3 | 2 | 15 min |
| Phase 2.4 | 3 | 45 min |
| Phase 2.5 | 4 | 30 min |
| **总计** | **13** | **~2.5 小时** |

---

开始执行？
