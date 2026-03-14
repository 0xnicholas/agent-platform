/**
 * GitHub Connector 工具定义
 */

export const githubTools = [
  {
    name: 'github_list_issues',
    description: '列出 GitHub 仓库的 Issue',
    inputSchema: {
      type: 'object' as const,
      properties: {
        owner: {
          type: 'string',
          description: '仓库所有者',
        },
        repo: {
          type: 'string',
          description: '仓库名称',
        },
        state: {
          type: 'string',
          enum: ['open', 'closed', 'all'],
          description: 'Issue 状态，默认 open',
        },
      },
      required: ['owner', 'repo'],
    },
  },
  {
    name: 'github_create_issue',
    description: '在 GitHub 仓库创建 Issue',
    inputSchema: {
      type: 'object' as const,
      properties: {
        owner: {
          type: 'string',
          description: '仓库所有者',
        },
        repo: {
          type: 'string',
          description: '仓库名称',
        },
        title: {
          type: 'string',
          description: 'Issue 标题',
        },
        body: {
          type: 'string',
          description: 'Issue 内容',
        },
        labels: {
          type: 'array',
          items: { type: 'string' },
          description: '标签数组',
        },
      },
      required: ['owner', 'repo', 'title'],
    },
  },
  {
    name: 'github_list_prs',
    description: '列出 GitHub 仓库的 Pull Request',
    inputSchema: {
      type: 'object' as const,
      properties: {
        owner: {
          type: 'string',
          description: '仓库所有者',
        },
        repo: {
          type: 'string',
          description: '仓库名称',
        },
        state: {
          type: 'string',
          enum: ['open', 'closed', 'all'],
          description: 'PR 状态，默认 open',
        },
      },
      required: ['owner', 'repo'],
    },
  },
  {
    name: 'github_list_commits',
    description: '列出 GitHub 仓库最近的 Commits',
    inputSchema: {
      type: 'object' as const,
      properties: {
        owner: {
          type: 'string',
          description: '仓库所有者',
        },
        repo: {
          type: 'string',
          description: '仓库名称',
        },
        limit: {
          type: 'number',
          description: '返回数量，默认 10',
        },
      },
      required: ['owner', 'repo'],
    },
  },
  {
    name: 'github_get_repo',
    description: '获取 GitHub 仓库信息',
    inputSchema: {
      type: 'object' as const,
      properties: {
        owner: {
          type: 'string',
          description: '仓库所有者',
        },
        repo: {
          type: 'string',
          description: '仓库名称',
        },
      },
      required: ['owner', 'repo'],
    },
  },
]
