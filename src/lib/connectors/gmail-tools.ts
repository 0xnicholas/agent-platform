/**
 * Gmail Connector 工具定义
 * 对应 Base44 的 Tool Calling
 */

export const gmailTools = [
  {
    name: 'gmail_send_email',
    description: '发送电子邮件',
    inputSchema: {
      type: 'object' as const,
      properties: {
        to: {
          type: 'string',
          description: '收件人邮箱地址',
        },
        subject: {
          type: 'string',
          description: '邮件主题',
        },
        body: {
          type: 'string',
          description: '邮件正文内容',
        },
      },
      required: ['to', 'subject', 'body'],
    },
  },
  {
    name: 'gmail_read_emails',
    description: '读取最近收到的邮件',
    inputSchema: {
      type: 'object' as const,
      properties: {
        max_results: {
          type: 'number',
          description: '返回邮件数量，默认 10',
        },
      },
    },
  },
  {
    name: 'gmail_search_emails',
    description: '搜索邮件',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: '搜索查询语句（如：from:xxx@gmail.com subject:urgent）',
        },
        max_results: {
          type: 'number',
          description: '返回结果数量，默认 10',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'gmail_list_labels',
    description: '获取邮件标签/分类列表',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
]
