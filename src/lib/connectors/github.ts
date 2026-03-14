/**
 * GitHub Connector 实现
 */

export interface GitHubConfig {
  token: string
}

export interface GitHubIssue {
  number: number
  title: string
  body: string
  state: 'open' | 'closed'
  labels: string[]
  assignees: string[]
}

export interface GitHubPR {
  number: number
  title: string
  body: string
  state: 'open' | 'closed' | 'merged'
  head: string
  base: string
}

const GITHUB_API = 'https://api.github.com'

async function callGitHub(endpoint: string, token: string, options?: RequestInit) {
  const response = await fetch(`${GITHUB_API}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`GitHub API error: ${error.message}`)
  }

  return response.json()
}

/**
 * 获取用户信息
 */
export async function getUser(config: GitHubConfig) {
  return callGitHub('/user', config.token)
}

/**
 * 获取仓库信息
 */
export async function getRepo(config: GitHubConfig, owner: string, repo: string) {
  return callGitHub(`/repos/${owner}/${repo}`, config.token)
}

/**
 * 获取 Issue 列表
 */
export async function getIssues(
  config: GitHubConfig,
  owner: string,
  repo: string,
  state: 'open' | 'closed' | 'all' = 'open'
): Promise<GitHubIssue[]> {
  const issues = await callGitHub(
    `/repos/${owner}/${repo}/issues?state=${state}`,
    config.token
  )
  return issues.filter((i: any) => !i.pull_request)
}

/**
 * 创建 Issue
 */
export async function createIssue(
  config: GitHubConfig,
  owner: string,
  repo: string,
  title: string,
  body: string,
  labels?: string[]
): Promise<GitHubIssue> {
  return callGitHub(`/repos/${owner}/${repo}/issues`, config.token, {
    method: 'POST',
    body: JSON.stringify({ title, body, labels }),
  })
}

/**
 * 获取 PR 列表
 */
export async function getPullRequests(
  config: GitHubConfig,
  owner: string,
  repo: string,
  state: 'open' | 'closed' | 'all' = 'open'
): Promise<GitHubPR[]> {
  return callGitHub(
    `/repos/${owner}/${repo}/pulls?state=${state}`,
    config.token
  )
}

/**
 * 获取 Commits
 */
export async function getCommits(
  config: GitHubConfig,
  owner: string,
  repo: string,
  limit = 10
): Promise<Array<{ sha: string; message: string; author: string }>> {
  const commits = await callGitHub(
    `/repos/${owner}/${repo}/commits?per_page=${limit}`,
    config.token
  )
  return commits.map((c: any) => ({
    sha: c.sha,
    message: c.commit.message,
    author: c.commit.author.name,
  }))
}
