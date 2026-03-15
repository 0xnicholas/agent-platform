/**
 * 共享类型定义 - Skills 和 Integrations
 */

export interface ConnectorCapability {
  type: string
  name: string
  icon: string
  description: string
  color: string
  authUrl?: string
  capabilities: string[]  // 提供的能力
  fields: { key: string; label: string; type: string }[]
}

// Connector 提供的能力
export const CONNECTOR_CAPABILITIES: Record<string, string> = {
  feishu: 'messaging, docs, cards',
  slack: 'messaging, channels',
  github: 'code, issues, prs',
  gmail: 'email',
}

// 能力标签
export const CAPABILITY_LABELS: Record<string, string> = {
  messaging: '💬 消息',
  docs: '📄 文档',
  cards: '🎴 卡片',
  channels: '📢 频道',
  code: '💻 代码',
  issues: '🐛 Issues',
  prs: '🔀 PRs',
  email: '📧 邮件',
}
