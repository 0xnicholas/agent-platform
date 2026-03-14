/**
 * Feishu Connector 实现
 * 飞书开放平台 API 集成
 */

export interface FeishuConfig {
  appId: string
  appSecret: string
}

export interface FeishuMessage {
  message_id: string
  chat_id: string
  sender: {
    sender_id: { open_id: string }
    sender_type: string
  }
  body: {
    content: string
    message_type: string
  }
  create_time: string
}

export interface FeishuUser {
  open_id: string
  union_id: string
  name: string
  avatar_url?: string
}

/**
 * 飞书 API 基础
 */
const FEISHU_API_BASE = 'https://open.feishu.cn/open-apis'

/**
 * 获取 tenant_access_token
 */
async function getTenantAccessToken(config: FeishuConfig): Promise<string> {
  const response = await fetch(`${FEISHU_API_BASE}/auth/v3/tenant_access_token/internal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      app_id: config.appId,
      app_secret: config.appSecret,
    }),
  })

  const data = await response.json()
  if (data.code !== 0) {
    throw new Error(`Feishu API error: ${data.msg}`)
  }

  return data.tenant_access_token
}

/**
 * 发送消息
 */
export async function sendMessage(
  config: FeishuConfig,
  chatId: string,
  content: string
): Promise<{ message_id: string }> {
  const token = await getTenantAccessToken(config)

  const response = await fetch(`${FEISHU_API_BASE}/im/v1/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      receive_id_type: 'chat_id',
      receive_id: chatId,
      msg_type: 'text',
      content: JSON.stringify({ text: content }),
    }),
  })

  const data = await response.json()
  if (data.code !== 0) {
    throw new Error(`Send message failed: ${data.msg}`)
  }

  return { message_id: data.data.message_id }
}

/**
 * 读取消息历史
 */
export async function getChatMessages(
  config: FeishuConfig,
  chatId: string,
  limit = 20
): Promise<FeishuMessage[]> {
  const token = await getTenantAccessToken(config)

  const response = await fetch(
    `${FEISHU_API_BASE}/im/v1/chats/${chatId}/messages?limit=${limit}`,
    {
      headers: { 'Authorization': `Bearer ${token}` },
    }
  )

  const data = await response.json()
  if (data.code !== 0) {
    throw new Error(`Get messages failed: ${data.msg}`)
  }

  return data.data.items || []
}

/**
 * 获取用户信息
 */
export async function getUserInfo(
  config: FeishuConfig,
  openId: string
): Promise<FeishuUser> {
  const token = await getTenantAccessToken(config)

  const response = await fetch(
    `${FEISHU_API_BASE}/contact/v3/users/${openId}`,
    {
      headers: { 'Authorization': `Bearer ${token}` },
    }
  )

  const data = await response.json()
  if (data.code !== 0) {
    throw new Error(`Get user failed: ${data.msg}`)
  }

  return data.data
}

/**
 * 创建机器人 webhook
 */
export async function createWebhook(
  config: FeishuConfig,
  url: string,
  name: string
): Promise<{ webhook_id: string }> {
  const token = await getTenantAccessToken(config)

  const response = await fetch(`${FEISHU_API_BASE}/im/v1/webhooks`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url,
      name,
    }),
  })

  const data = await response.json()
  if (data.code !== 0) {
    throw new Error(`Create webhook failed: ${data.msg}`)
  }

  return { webhook_id: data.data.webhook.webhook_id }
}
