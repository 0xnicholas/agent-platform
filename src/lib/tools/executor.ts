/**
 * Tool Executor - LLM 工具调用执行器
 * 根据 LLM 返回的 tool_calls 执行对应的 connector 工具
 */

import { feishuTools, feishuSendMessage, feishuReadMessages, feishuGetUserInfo, feishuSearchMessages, feishuCreateDoc, feishuReadDoc, feishuListDocs } from '../connectors/feishu'
import { slackTools, slackSendMessage, slackGetMessages } from '../connectors/slack'
import { githubTools } from '../connectors/github'
import { gmailTools, gmailSendEmail, gmailReadEmails, gmailSearchEmails, gmailListLabels } from '../connectors/gmail'

export interface ToolExecutionResult {
  toolCallId: string
  result: unknown
  error?: string
}

/**
 * 工具注册表
 */
const toolRegistry: Record<string, any> = {
  // Feishu tools
  feishu_send_message: feishuSendMessage,
  feishu_read_messages: feishuReadMessages,
  feishu_search_messages: feishuSearchMessages,
  feishu_get_user_info: feishuGetUserInfo,
  feishu_create_doc: feishuCreateDoc,
  feishu_read_doc: feishuReadDoc,
  feishu_list_docs: feishuListDocs,

  // Slack tools
  slack_send_message: slackSendMessage,
  slack_get_messages: slackGetMessages,

  // Gmail tools
  gmail_send_email: gmailSendEmail,
  gmail_read_emails: gmailReadEmails,
  gmail_search_emails: gmailSearchEmails,
  gmail_list_labels: gmailListLabels,
}

/**
 * 工具参数类型
 */
interface ToolContext {
  agentId: string
  workspaceId: string
  config: Record<string, any>
}

/**
 * 执行单个工具调用
 */
export async function executeTool(
  toolName: string,
  toolInput: Record<string, unknown>,
  context: ToolContext
): Promise<ToolExecutionResult> {
  const toolFunction = toolRegistry[toolName]

  if (!toolFunction) {
    return {
      toolCallId: '',
      result: null,
      error: `Tool ${toolName} not found`,
    }
  }

  try {
    // 提取需要的配置
    const config = extractConfig(toolName, context.config)
    
    // 执行工具
    const result = await toolFunction(config, ...Object.values(toolInput))

    return {
      toolCallId: '',
      result,
    }
  } catch (error) {
    return {
      toolCallId: '',
      result: null,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * 批量执行工具调用
 */
export async function executeTools(
  toolCalls: Array<{ id: string; name: string; input: Record<string, unknown> }>,
  context: ToolContext
): Promise<ToolExecutionResult[]> {
  const results: ToolExecutionResult[] = []

  for (const toolCall of toolCalls) {
    const result = await executeTool(toolCall.name, toolCall.input, context)
    result.toolCallId = toolCall.id
    results.push(result)
  }

  return results
}

/**
 * 串行执行工具（按顺序，一个完成后执行下一个）
 */
export async function executeToolsSequentially(
  toolCalls: Array<{ id: string; name: string; input: Record<string, unknown> }>,
  context: ToolContext,
  onProgress?: (index: number, result: ToolExecutionResult) => void
): Promise<ToolExecutionResult[]> {
  const results: ToolExecutionResult[] = []

  for (let i = 0; i < toolCalls.length; i++) {
    const toolCall = toolCalls[i]
    const result = await executeTool(toolCall.name, toolCall.input, context)
    result.toolCallId = toolCall.id
    results.push(result)

    if (onProgress) {
      onProgress(i, result)
    }

    // 如果出错，停止执行
    if (result.error) {
      break
    }
  }

  return results
}

/**
 * 并行执行工具
 */
export async function executeToolsInParallel(
  toolCalls: Array<{ id: string; name: string; input: Record<string, unknown> }>,
  context: ToolContext
): Promise<ToolExecutionResult[]> {
  const promises = toolCalls.map(async (toolCall) => {
    const result = await executeTool(toolCall.name, toolCall.input, context)
    result.toolCallId = toolCall.id
    return result
  })

  return Promise.all(promises)
}

/**
 * 从 agent 配置中提取对应 connector 的配置
 */
function extractConfig(toolName: string, agentConfig: Record<string, any>): Record<string, any> {
  // 工具名前缀映射到 connector 类型
  const prefixMap: Record<string, string> = {
    feishu: 'feishu',
    slack: 'slack',
    github: 'github',
    gmail: 'gmail',
  }

  const prefix = toolName.split('_')[0]
  const connectorType = prefixMap[prefix]

  if (!connectorType) {
    return {}
  }

  // 从 agent 配置中获取对应 connector 的配置
  return agentConfig.connectors?.[connectorType] || {}
}

/**
 * 获取所有可用工具定义
 */
export function getAllToolDefinitions() {
  return [
    ...feishuTools,
    ...slackTools,
    ...githubTools,
    ...gmailTools,
  ]
}
