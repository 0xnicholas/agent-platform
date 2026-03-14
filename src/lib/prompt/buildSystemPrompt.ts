/**
 * System Prompt 构建器
 * 按照 CLAUDE.md 规范顺序拼装
 */

export interface Profile {
  identity?: string
  principles?: string
  tone?: string
  userContext?: string
  knowledgeFiles?: KnowledgeFile[]
}

export interface Memory {
  savedFacts: string[]
}

export interface KnowledgeFile {
  id: string
  name: string
}

/**
 * System prompt 拼装顺序（重要，影响 LLM 效果）
 * 
 * 1. 角色设定 (identity)
 * 2. 行为原则 (principles)
 * 3. 沟通风格 (tone)
 * 4. 用户背景 (userContext)
 * 5. 记住的信息 (savedFacts)
 * 6. 当前时间
 */
export function buildSystemPrompt(profile: Profile, memory: Memory): string {
  const parts: string[] = []

  // 1. 角色设定
  if (profile.identity) {
    parts.push(`# 角色设定\n${profile.identity}`)
  }

  // 2. 行为原则
  if (profile.principles) {
    parts.push(`# 行为原则\n${profile.principles}`)
  }

  // 3. 沟通风格
  if (profile.tone) {
    parts.push(`# 沟通风格\n${profile.tone}`)
  }

  // 4. 用户背景
  if (profile.userContext) {
    parts.push(`# 用户背景\n${profile.userContext}`)
  }

  // 5. 记住的信息 (Memory)
  if (memory.savedFacts && memory.savedFacts.length > 0) {
    parts.push(`# 记住的信息\n${memory.savedFacts.join('\n')}`)
  }

  // 6. 当前时间
  parts.push(`# 当前时间\n${new Date().toISOString()}`)

  return parts.filter(Boolean).join('\n\n')
}

/**
 * 快速构建简单 prompt
 */
export function buildSimplePrompt(identity: string, instructions?: string): string {
  const parts = [`# 角色\n${identity}`]
  
  if (instructions) {
    parts.push(`# 指令\n${instructions}`)
  }
  
  parts.push(`# 时间\n${new Date().toISOString()}`)
  
  return parts.join('\n\n')
}
