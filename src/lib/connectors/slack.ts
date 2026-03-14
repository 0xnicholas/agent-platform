/**
 * Slack Connector 实现
 */

export interface SlackConfig {
  botToken: string
  signingSecret: string
}

export interface SlackMessage {
  channel: string
  text: string
  ts?: string
  thread_ts?: string
}

export interface SlackChannel {
  id: string
  name: string
  is_channel: boolean
  is_group: boolean
  is_im: boolean
}

const SLACK_API = 'https://slack.com/api'

async function callSlack(method: string, token: string, body?: object) {
  const response = await fetch(`${SLACK_API}/${method}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  return response.json()
}

/**
 * 发送消息
 */
export async function sendMessage(
  config: SlackConfig,
  channel: string,
  text: string,
  threadTs?: string
): Promise<{ ts: string }> {
  const result = await callSlack('chat.postMessage', config.botToken, {
    channel,
    text,
    thread_ts: threadTs,
  })

  if (!result.ok) {
    throw new Error(`Slack error: ${result.error}`)
  }

  return { ts: result.ts }
}

/**
 * 读取消息
 */
export async function getMessages(
  config: SlackConfig,
  channel: string,
  limit = 20
): Promise<Array<{ ts: string; text: string; user: string }>> {
  const result = await callSlack('conversations.history', config.botToken, {
    channel,
    limit,
  })

  if (!result.ok) {
    throw new Error(`Slack error: ${result.error}`)
  }

  return result.messages.map((m: any) => ({
    ts: m.ts,
    text: m.text,
    user: m.user,
  }))
}

/**
 * 获取频道列表
 */
export async function getChannels(config: SlackConfig): Promise<SlackChannel[]> {
  const result = await callSlack('conversations.list', config.botToken, {
    types: 'public_channel,private_channel,im',
  })

  if (!result.ok) {
    throw new Error(`Slack error: ${result.error}`)
  }

  return result.channels
}

/**
 * 搜索消息
 */
export async function searchMessages(
  config: SlackConfig,
  query: string
): Promise<Array<{ ts: string; text: string; channel: string }>> {
  const result = await callSlack('search.messages', config.botToken, {
    query,
  })

  if (!result.ok) {
    throw new Error(`Slack error: ${result.error}`)
  }

  return result.messages.matches.map((m: any) => ({
    ts: m.ts,
    text: m.text,
    channel: m.channel.id,
  }))
}
