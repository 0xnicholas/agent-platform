# Connector: Feishu (飞书)

> 飞书Connector 实现规范

## 能力清单

### 1. 消息能力

| Tool | 说明 | 优先级 |
|------|------|--------|
| `feishu_send_message` | 发送消息（私聊/群聊） | P0 |
| `feishu_read_messages` | 读取消息历史 | P0 |
| `feishu_reply_message` | 回复指定消息 | P1 |
| `feishu_search_messages` | 搜索消息 | P2 |

### 2. 机器人能力

| Tool | 说明 | 优先级 |
|------|------|--------|
| `feishu_create_bot` | 创建机器人 | P0 |
| `feishu_configure_bot` | 配置机器人 | P0 |
| `feishu_get_bot_info` | 获取机器人信息 | P1 |
| `feishu_set_webhook` | 配置 Webhook | P1 |

### 3. 文档/云空间

| Tool | 说明 | 优先级 |
|------|------|--------|
| `feishu_read_doc` | 读取文档内容 | P0 |
| `feishu_create_doc` | 创建新文档 | P1 |
| `feishu_update_doc` | 更新文档 | P1 |
| `feishu_list_docs` | 列出云空间文档 | P0 |
| `feishu_upload_file` | 上传文件到云空间 | P2 |
| `feishu_download_file` | 下载云空间文件 | P2 |

---

## OAuth 流程

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   用户      │     │   平台      │     │   飞书      │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       │ 1. 点击连接飞书   │                   │
       │ ──────────────>  │                   │
       │                   │                   │
       │ 2. 跳转飞书授权   │                   │
       │ <──────────────  │                   │
       │                   │                   │
       │ 3. 用户授权       │                   │
       │ ──────────────────────────────────>  │
       │                   │                   │
       │ 4. 返回 code      │                   │
       │ <──────────────────────────────────  │
       │                   │                   │
       │ 5. 交换 token    │                   │
       │ ──────────────>  │                   │
       │                   │ ──────────────>  │
       │                   │ <──────────────  │
       │                   │                   │
       │ 6. 保存 token    │                   │
       │ <─────────────  │                   │
```

---

## 认证方式

- **OAuth 2.0**: 标准的飞书开放平台 OAuth
- **App ID + App Secret**: 用于机器人 API 调用

---

## 所需权限 (Scopes)

```
- contact:user.base:readonly     # 读取用户基本信息
- im:message:send_as_bot        # 以机器人身份发送消息
- im:message:read                # 读取消息
- im:chat:readonly              # 读取群聊信息
- drive:drive:readonly          # 读取云空间
- drive:drive:upload            # 上传云空间
```

---

## API 端点

### 消息

| API | 方法 | 说明 |
|-----|------|------|
| `/open-apis/im/v1/messages` | POST | 发送消息 |
| `/open-apis/im/v1/messages/{message_id}` | GET | 获取消息 |
| `/open-apis/im/v1/chats/{chat_id}/messages` | GET | 获取群聊消息 |

### 机器人

| API | 方法 | 说明 |
|-----|------|------|
| `/open-apis/bot/v3/info` | GET | 获取机器人信息 |
| `/open-apis/im/v1/messages/webhooks` | POST | Webhook 配置 |

### 文档

| API | 方法 | 说明 |
|-----|------|------|
| `/open-apis/drive/v1/files/{file_token}/download` | GET | 下载文件 |
| `/open-apis/drive/v1/files` | POST | 上传文件 |
| `/open-apis/docx/v1/documents` | POST | 创建文档 |
| `/open-apis/docx/v1/documents/{document_id}/body` | GET | 获取文档内容 |

---

## 实现计划

### Phase 2.1: 消息能力

| 任务 | 说明 |
|------|------|
| T221 | 实现 OAuth 接入 |
| T222 | 实现消息发送 |
| T223 | 实现消息读取 |
| T224 | 测试消息功能 |

### Phase 2.2: 机器人能力

| 任务 | 说明 |
|------|------|
| T225 | 实现机器人配置 |
| T226 | 实现 Webhook |
| T227 | 测试机器人 |

### Phase 2.3: 文档能力

| 任务 | 说明 |
|------|------|
| T228 | 实现文档读取 |
| T229 | 实现文档创建 |
| T230 | 实现云空间访问 |

---

## 参考文档

- 飞书开放平台: https://open.feishu.cn/
- API 文档: https://open.feishu.cn/document/server-docs/im-v1/message-content-description
