-- =====================================================
-- Task Scheduling with pg_cron
-- =====================================================

-- 启用 pg_cron 扩展
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 创建任务调度函数
CREATE OR REPLACE FUNCTION cron.job_task_runner()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_task RECORD;
  v_task_id UUID;
  v_function_url TEXT;
  v_response RECORD;
BEGIN
  -- 查找需要执行的任务（基于 cron 表达式）
  FOR v_task IN
    SELECT 
      t.id,
      t.agent_id,
      t.trigger->>'expression' as cron_expression,
      t.trigger->>'timezone' as timezone,
      t.prompt,
      a.profile,
      a.model_config
    FROM tasks t
    JOIN agents a ON t.agent_id = a.id
    WHERE t.is_active = true
      AND (
        t.last_run_at IS NULL 
        OR cron.schedule_exists(cron.job_id) = false
      )
  LOOP
    -- 调用 task-run Edge Function
    v_function_url := COALESCE(
      current_setting('app.settings.function_url', true),
      'https://qyitxvmbhpomqfasumok.supabase.co/functions/v1/task-run'
    );
    
    -- 使用 supabase_admin 执行 HTTP 请求
    PERFORM supabase_http.request(
      'POST',
      '/functions/v1/task-run',
      jsonb_build_object(
        'Content-Type', 'application/json'
      )::jsonb,
      jsonb_build_object(
        'task_id', v_task.id
      )::jsonb
    );
  END LOOP;
END;
$$;

-- 调度：每分钟检查一次任务
SELECT cron.schedule(
  'task-scheduler',
  '* * * * *',
  'SELECT cron.job_task_runner()'
);

-- 创建 task_runs 表索引（如果不存在）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_task_runs_task_id'
  ) THEN
    CREATE INDEX idx_task_runs_task_id ON task_runs(task_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_tasks_agent_id'
  ) THEN
    CREATE INDEX idx_tasks_agent_id ON tasks(agent_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_tasks_is_active'
  ) THEN
    CREATE INDEX idx_tasks_is_active ON tasks(is_active);
  END IF;
END
$$;

-- 为每个 active task 创建独立的 cron schedule
CREATE OR REPLACE FUNCTION cron.setup_task_cron()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_task RECORD;
  v_job_name TEXT;
BEGIN
  FOR v_task IN
    SELECT id, name, trigger->>'expression' as cron_expr
    FROM tasks
    WHERE is_active = true
      AND trigger->>'type' = 'cron'
      AND trigger->>'expression' IS NOT NULL
  LOOP
    v_job_name := 'task-' || v_task.id::text;
    
    -- 如果 job 已存在，先 unschedule
    IF cron.unschedule(v_job_name) THEN
      NULL;
    END IF;
    
    -- 创建新的 schedule
    PERFORM cron.schedule(
      v_job_name,
      v_task.cron_expr,
      format('SELECT cron.execute_task(%L)', v_task.id)
    );
  END LOOP;
END;
$$;

-- 创建执行任务的函数（供 cron 调用）
CREATE OR REPLACE FUNCTION cron.execute_task(p_task_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_task RECORD;
  v_agent RECORD;
  v_system_prompt TEXT;
  v_summary JSONB;
  v_status TEXT;
BEGIN
  -- 获取任务和 agent 信息
  SELECT t.*, a.profile, a.model_config INTO v_task, v_agent
  FROM tasks t
  JOIN agents a ON t.agent_id = a.id
  WHERE t.id = p_task_id;

  IF NOT FOUND OR v_task.is_active = false THEN
    RETURN;
  END IF;

  -- 构建 system prompt
  v_system_prompt := (
    SELECT string_agg(line, E'\n')
    FROM (
      SELECT COALESCE('# 角色设定\n' || (v_agent.profile->>'identity'), '') AS line
      UNION ALL
      SELECT COALESCE('# 行为原则\n' || (v_agent.profile->>'principles'), '')
      UNION ALL
      SELECT COALESCE('# 沟通风格\n' || (v_agent.profile->>'tone'), '')
      UNION ALL
      SELECT '# 当前时间\n' || NOW()::text
      UNION ALL
      SELECT '# 任务模式\n你正在执行一个自动化任务，请直接给出结果。'
    ) lines
    WHERE line <> ''
  );

  -- 更新任务状态为 running
  UPDATE tasks 
  SET last_run_at = NOW(), last_run_status = 'running'
  WHERE id = p_task_id;

  -- 注意：实际 LLM 调用需要在 Edge Function 中完成
  -- 这里只记录执行开始
  
  v_summary := jsonb_build_object(
    'status', 'pending',
    'started_at', NOW()::text,
    'message', 'Task execution initiated, awaiting Edge Function'
  );

  -- 记录执行
  INSERT INTO task_runs (task_id, status, summary, started_at)
  VALUES (p_task_id, 'running', v_summary, NOW());
END;
$$;

COMMENT ON FUNCTION cron.execute_task(UUID) IS 'Execute a task by calling the task-run Edge Function';
COMMENT ON FUNCTION cron.job_task_runner() IS 'Main scheduler that checks and runs due tasks';
