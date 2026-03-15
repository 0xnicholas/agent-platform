/**
 * Gmail Connector 实现
 * Google Gmail API 集成
 */

export interface GmailConfig {
  clientId: string
  clientSecret: string
  refreshToken?: string
}

export interface GmailMessage {
  id: string
  threadId: string
  subject: string
  from: string
  to: string
  date: string
  snippet: string
  body?: string
}

export interface GmailLabel {
  id: string
  name: string
  type: 'system' | 'user'
}

/**
 * Gmail API 基础
 */
const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1'

/**
 * 发送邮件
 */
export async function sendEmail(
  config: GmailConfig,
  to: string,
  subject: string,
  body: string
): Promise<{ messageId: string }> {
  if (!config.refreshToken) {
    throw new Error('Gmail refresh token not configured')
  }

  // 先获取 access token
  const accessToken = await getAccessToken(config)

  const message = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'Content-Type: text/plain; charset=UTF-8',
    '',
    body,
  ].join('\n')

  const encodedMessage = btoa(unescape(encodeURIComponent(message)))

  const response = await fetch(`${GMAIL_API_BASE}/users/me/messages/send`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      raw: encodedMessage,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Gmail API error: ${error.error?.message || 'Unknown error'}`)
  }

  const data = await response.json()
  return { messageId: data.id }
}

/**
 * 读取邮件
 */
export async function getMessages(
  config: GmailConfig,
  maxResults = 10
): Promise<GmailMessage[]> {
  if (!config.refreshToken) {
    throw new Error('Gmail refresh token not configured')
  }

  const accessToken = await getAccessToken(config)

  const response = await fetch(
    `${GMAIL_API_BASE}/users/me/messages?maxResults=${maxResults}`,
    {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Gmail API error: ${error.error?.message || 'Unknown error'}`)
  }

  const data = await response.json()
  
  // 获取每封邮件的详情
  const messages: GmailMessage[] = []
  for (const msg of data.messages || []) {
    const detail = await getMessageDetail(config, msg.id)
    if (detail) {
      messages.push(detail)
    }
  }

  return messages
}

/**
 * 获取单封邮件详情
 */
export async function getMessageDetail(
  config: GmailConfig,
  messageId: string
): Promise<GmailMessage | null> {
  if (!config.refreshToken) {
    throw new Error('Gmail refresh token not configured')
  }

  const accessToken = await getAccessToken(config)

  const response = await fetch(
    `${GMAIL_API_BASE}/users/me/messages/${messageId}?format=full`,
    {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    }
  )

  if (!response.ok) {
    return null
  }

  const data = await response.json()
  
  const headers = data.payload?.headers || []
  const getHeader = (name: string) => 
    headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || ''

  return {
    id: data.id,
    threadId: data.threadId,
    subject: getHeader('Subject'),
    from: getHeader('From'),
    to: getHeader('To'),
    date: getHeader('Date'),
    snippet: data.snippet,
  }
}

/**
 * 获取标签列表
 */
export async function getLabels(config: GmailConfig): Promise<GmailLabel[]> {
  if (!config.refreshToken) {
    throw new Error('Gmail refresh token not configured')
  }

  const accessToken = await getAccessToken(config)

  const response = await fetch(`${GMAIL_API_BASE}/users/me/labels`, {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Gmail API error: ${error.error?.message || 'Unknown error'}`)
  }

  const data = await response.json()
  return (data.labels || []).map((label: any) => ({
    id: label.id,
    name: label.name,
    type: label.type as 'system' | 'user',
  }))
}

/**
 * 使用 refresh_token 获取 access_token
 */
async function getAccessToken(config: GmailConfig): Promise<string> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: config.refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Failed to get access token: ${error.error_description || error.error || 'Unknown error'}`)
  }

  const data = await response.json()
  return data.access_token
}

/**
 * 获取 OAuth 授权 URL
 */
export function getAuthUrl(clientId: string, redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: [
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.labels',
    ].join(' '),
    access_type: 'offline',
    prompt: 'consent',
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`
}
