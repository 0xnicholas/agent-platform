/**
 * Slack Connector 工具定义
 */

export const slackTools = [
  {
    name: 'slack_send_message',
    description: '在 Slack 频道或私聊中发送消息',
    inputSchema: {
      type: 'object' as const,
      properties: {
        channel: {
          type: 'string',
          description: '频道 ID（如 C01ABC123）或用户 ID（如 U01XYZ789）',
        },
        text: {
          type: 'string',
          description: '消息内容',
        },
        thread_ts: {
          type: 'string',
          description: '可选：父消息 ts，用于回复线程',
        },
      },
      required: ['channel', 'text'],
    },
  },
  {
    name: 'slack_read_messages',
    description: '读取 Slack 频道或私聊的消息历史',
    inputSchema: {
      type: 'object' as const,
      properties: {
        channel: {
          type: 'string',
          description: '频道 ID',
        },
        limit: {
          type: 'number',
          description: '返回消息数量，默认 20',
        },
      },
      required: ['channel'],
    },
  },
  {
    name: 'slack_list_channels',
    description: '列出可用的 Slack 频道和私聊',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'slack_search_messages',
    description: '搜索 Slack 中的消息',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: '搜索关键词',
        },
      },
      required: ['query'],
    },
  },
]
