-- =====================================================
-- Phase 2: 多 Agent 协作 - Teams Schema
-- =====================================================

-- 1. Agent 团队表
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    
    -- 编排模式: sequential | parallel | hierarchical | router | ensemble
    mode TEXT NOT NULL DEFAULT 'sequential',
    
    -- 共享上下文
    shared_context JSONB DEFAULT '{}',
    
    -- 状态
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 团队成员表
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    
    -- 角色: coordinator | worker | specialist
    role TEXT NOT NULL DEFAULT 'worker',
    
    -- 职责描述
    responsibilities TEXT[] DEFAULT '{}',
    
    -- 输入/输出 schema
    input_schema JSONB DEFAULT '{}',
    output_schema JSONB DEFAULT '{}',
    
    -- 排序顺序
    order_index INT DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(team_id, agent_id)
);

-- 3. 团队执行记录表
CREATE TABLE IF NOT EXISTS team_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    
    -- 执行状态
    status TEXT NOT NULL DEFAULT 'pending', -- pending | running | completed | failed
    
    -- 输入任务
    input_task TEXT,
    
    -- 执行结果
    results JSONB DEFAULT '{}',
    
    -- 执行时长
    started_at TIMESTAMPTZ DEFAULT NOW(),
    finished_at TIMESTAMPTZ,
    
    -- 错误信息
    error_message TEXT
);

-- =====================================================
-- RLS 策略
-- =====================================================

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_executions ENABLE ROW LEVEL SECURITY;

-- Teams RLS
CREATE POLICY "teams_select" ON teams FOR SELECT
    USING (workspace_id IN (
        SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    ));

CREATE POLICY "teams_insert" ON teams FOR INSERT
    WITH CHECK (workspace_id IN (
        SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    ));

CREATE POLICY "teams_update" ON teams FOR UPDATE
    USING (workspace_id IN (
        SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    ));

CREATE POLICY "teams_delete" ON teams FOR DELETE
    USING (workspace_id IN (
        SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    ));

-- Team Members RLS
CREATE POLICY "team_members_select" ON team_members FOR SELECT
    USING (team_id IN (
        SELECT id FROM teams WHERE workspace_id IN (
            SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
        )
    ));

CREATE POLICY "team_members_insert" ON team_members FOR INSERT
    WITH CHECK (team_id IN (
        SELECT id FROM teams WHERE workspace_id IN (
            SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
        )
    ));

CREATE POLICY "team_members_delete" ON team_members FOR DELETE
    USING (team_id IN (
        SELECT id FROM teams WHERE workspace_id IN (
            SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
        )
    ));

-- Team Executions RLS
CREATE POLICY "team_executions_select" ON team_executions FOR SELECT
    USING (team_id IN (
        SELECT id FROM teams WHERE workspace_id IN (
            SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
        )
    ));

CREATE POLICY "team_executions_insert" ON team_executions FOR INSERT
    WITH CHECK (team_id IN (
        SELECT id FROM teams WHERE workspace_id IN (
            SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
        )
    ));

-- =====================================================
-- 索引优化
-- =====================================================

CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_agent_id ON team_members(agent_id);
CREATE INDEX idx_team_executions_team_id ON team_executions(team_id);
CREATE INDEX idx_team_executions_status ON team_executions(status);
CREATE INDEX idx_teams_workspace_id ON teams(workspace_id);
