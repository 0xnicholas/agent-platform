/**
 * Feishu Connector 工具定义
 * 对应 Base44 的 Tool Calling
 */

export const feishuTools = [
  {
    name: 'feishu_send_message',
    description: '发送消息到飞书聊天（私聊或群聊）',
    inputSchema: {
      type: 'object' as const,
      properties: {
        chat_id: {
          type: 'string',
          description: '聊天 ID（私聊或群聊）',
        },
        content: {
          type: 'string',
          description: '消息内容',
        },
      },
      required: ['chat_id', 'content'],
    },
  },
  {
    name: 'feishu_read_messages',
    description: '读取飞书聊天消息历史',
    inputSchema: {
      type: 'object' as const,
      properties: {
        chat_id: {
          type: 'string',
          description: '聊天 ID',
        },
        limit: {
          type: 'number',
          description: '返回消息数量，默认 20',
        },
      },
      required: ['chat_id'],
    },
  },
  {
    name: 'feishu_search_messages',
    description: '搜索飞书聊天消息',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: '搜索关键词',
        },
        chat_id: {
          type: 'string',
          description: '可选：限定聊天 ID',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'feishu_get_user_info',
    description: '获取飞书用户信息',
    inputSchema: {
      type: 'object' as const,
      properties: {
        open_id: {
          type: 'string',
          description: '用户 Open ID',
        },
      },
      required: ['open_id'],
    },
  },
  {
    name: 'feishu_create_doc',
    description: '在飞书云空间中创建文档',
    inputSchema: {
      type: 'object' as const,
      properties: {
        title: {
          type: 'string',
          description: '文档标题',
        },
        content: {
          type: 'string',
          description: '文档内容（Markdown）',
        },
      },
      required: ['title'],
    },
  },
  {
    name: 'feishu_read_doc',
    description: '读取飞书文档内容',
    inputSchema: {
      type: 'object' as const,
      properties: {
        document_id: {
          type: 'string',
          description: '文档 ID',
        },
      },
      required: ['document_id'],
    },
  },
  {
    name: 'feishu_list_docs',
    description: '列出飞书云空间中的文档',
    inputSchema: {
      type: 'object' as const,
      properties: {
        folder_id: {
          type: 'string',
          description: '文件夹 ID（可选）',
        },
        limit: {
          type: 'number',
          description: '返回数量，默认 20',
        },
      },
    },
  },
]
