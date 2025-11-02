# API Documentation - SaaSify

## Overview

The SaaSify API allows you to programmatically interact with your workspace, projects, tasks, and team members. Build custom integrations, automate workflows, and extend SaaSify's functionality.

**Base URL:** `https://api.saasify.com/v1`

**Authentication:** Bearer token (API key)

**Rate Limits:** See [Rate Limiting](#rate-limiting) section

---

## Getting Started

### Prerequisites

- SaaSify account (Professional or Enterprise plan)
- API access enabled in your workspace
- Admin or Owner role

### Generate API Key

1. Go to **Settings** → **API**
2. Click **"Generate New API Key"**
3. Copy and store securely (shown only once)
4. Never commit API keys to version control

**Key Format:** `saas_sk_live_xxxxxxxxxxxxxxxxxx`

### Authentication

Include your API key in the Authorization header:

```bash
Authorization: Bearer saas_sk_live_xxxxxxxxxxxxxxxxxx
```

**Example Request:**
```bash
curl https://api.saasify.com/v1/projects \
  -H "Authorization: Bearer YOUR_API_KEY"
```

---

## Core Endpoints

### Projects

#### List Projects
```http
GET /v1/projects
```

**Query Parameters:**
- `page` (integer): Page number (default: 1)
- `limit` (integer): Results per page (max: 100, default: 20)
- `status` (string): Filter by status (active, archived)
- `sort` (string): Sort by field (created_at, updated_at, name)

**Response:**
```json
{
  "data": [
    {
      "id": "proj_abc123",
      "name": "Website Redesign",
      "description": "Q1 2026 website redesign project",
      "status": "active",
      "owner_id": "user_xyz789",
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-11-01T15:30:00Z",
      "task_count": 45,
      "member_count": 8
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "total_pages": 1
  }
}
```

#### Create Project
```http
POST /v1/projects
```

**Request Body:**
```json
{
  "name": "New Project",
  "description": "Project description",
  "status": "active",
  "color": "#3498db",
  "template_id": "template_123" // optional
}
```

**Response:** `201 Created`
```json
{
  "id": "proj_new123",
  "name": "New Project",
  "status": "active",
  "created_at": "2025-11-02T10:00:00Z"
}
```

#### Get Project
```http
GET /v1/projects/{project_id}
```

**Response:** `200 OK` (same structure as list item)

#### Update Project
```http
PATCH /v1/projects/{project_id}
```

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "status": "archived"
}
```

#### Delete Project
```http
DELETE /v1/projects/{project_id}
```

**Response:** `204 No Content`

---

### Tasks

#### List Tasks
```http
GET /v1/projects/{project_id}/tasks
```

**Query Parameters:**
- `page`, `limit`: Pagination
- `assignee_id`: Filter by assignee
- `status`: Filter by status (todo, in_progress, done)
- `priority`: Filter by priority (low, medium, high, urgent)
- `due_before`: ISO date (tasks due before date)
- `due_after`: ISO date (tasks due after date)

**Response:**
```json
{
  "data": [
    {
      "id": "task_abc123",
      "project_id": "proj_xyz789",
      "name": "Design homepage mockup",
      "description": "Create high-fidelity mockup for homepage",
      "status": "in_progress",
      "priority": "high",
      "assignee_id": "user_123",
      "due_date": "2025-11-10T00:00:00Z",
      "created_at": "2025-11-01T09:00:00Z",
      "updated_at": "2025-11-02T10:30:00Z",
      "completed_at": null,
      "subtask_count": 3,
      "comment_count": 7,
      "labels": ["design", "frontend"]
    }
  ],
  "pagination": { ... }
}
```

#### Create Task
```http
POST /v1/projects/{project_id}/tasks
```

**Request Body:**
```json
{
  "name": "Task name",
  "description": "Task description (markdown supported)",
  "assignee_id": "user_123",
  "status": "todo",
  "priority": "medium",
  "due_date": "2025-11-15T00:00:00Z",
  "labels": ["bug", "urgent"],
  "parent_task_id": "task_parent123" // for subtasks
}
```

#### Update Task
```http
PATCH /v1/tasks/{task_id}
```

**Request Body:** (all fields optional)
```json
{
  "status": "done",
  "assignee_id": "user_456",
  "priority": "low"
}
```

#### Delete Task
```http
DELETE /v1/tasks/{task_id}
```

---

### Users & Team Members

#### List Team Members
```http
GET /v1/workspace/members
```

**Response:**
```json
{
  "data": [
    {
      "id": "user_abc123",
      "email": "john@example.com",
      "name": "John Smith",
      "role": "member",
      "avatar_url": "https://cdn.saasify.com/avatars/user_abc123.jpg",
      "status": "active",
      "joined_at": "2025-01-10T08:00:00Z",
      "last_active_at": "2025-11-02T09:45:00Z"
    }
  ]
}
```

#### Invite User
```http
POST /v1/workspace/invitations
```

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "role": "member", // member, admin
  "message": "Welcome to the team!" // optional
}
```

#### Remove User
```http
DELETE /v1/workspace/members/{user_id}
```

---

### Comments

#### List Comments
```http
GET /v1/tasks/{task_id}/comments
```

#### Create Comment
```http
POST /v1/tasks/{task_id}/comments
```

**Request Body:**
```json
{
  "content": "Great work! @john please review.",
  "mentions": ["user_john123"]
}
```

#### Update Comment
```http
PATCH /v1/comments/{comment_id}
```

#### Delete Comment
```http
DELETE /v1/comments/{comment_id}
```

---

### Files & Attachments

#### Upload File
```http
POST /v1/tasks/{task_id}/attachments
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: The file to upload (max 100MB for Pro, 2GB for Enterprise)

**Response:**
```json
{
  "id": "file_abc123",
  "filename": "design-mockup.png",
  "size": 2458624,
  "mime_type": "image/png",
  "url": "https://cdn.saasify.com/files/...",
  "uploaded_at": "2025-11-02T10:00:00Z"
}
```

#### List Attachments
```http
GET /v1/tasks/{task_id}/attachments
```

#### Delete Attachment
```http
DELETE /v1/attachments/{attachment_id}
```

---

### Webhooks

#### Create Webhook
```http
POST /v1/webhooks
```

**Request Body:**
```json
{
  "url": "https://yourapp.com/webhooks/saasify",
  "events": [
    "task.created",
    "task.updated",
    "task.completed",
    "comment.created",
    "project.created"
  ],
  "secret": "your_webhook_secret" // for signature verification
}
```

**Response:**
```json
{
  "id": "webhook_abc123",
  "url": "https://yourapp.com/webhooks/saasify",
  "events": ["task.created", "task.updated"],
  "created_at": "2025-11-02T10:00:00Z",
  "status": "active"
}
```

#### List Webhooks
```http
GET /v1/webhooks
```

#### Delete Webhook
```http
DELETE /v1/webhooks/{webhook_id}
```

#### Webhook Payload Example
```json
{
  "event": "task.created",
  "timestamp": "2025-11-02T10:30:00Z",
  "data": {
    "id": "task_abc123",
    "project_id": "proj_xyz789",
    "name": "New task",
    "created_by": "user_123"
  }
}
```

**Signature Verification:**
```
X-Saasify-Signature: sha256=<hmac_signature>
```

---

## Error Handling

### HTTP Status Codes

- `200 OK`: Success
- `201 Created`: Resource created
- `204 No Content`: Success with no response body
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Invalid or missing API key
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (e.g., duplicate)
- `422 Unprocessable Entity`: Validation error
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error
- `503 Service Unavailable`: Temporary outage

### Error Response Format

```json
{
  "error": {
    "type": "validation_error",
    "message": "Invalid request parameters",
    "code": "INVALID_PARAMS",
    "details": [
      {
        "field": "due_date",
        "message": "Must be a valid ISO 8601 date"
      }
    ]
  }
}
```

---

## Rate Limiting

### Limits by Plan

**Professional:**
- 1,000 requests per hour per API key
- Burst: 100 requests per minute

**Enterprise:**
- 10,000 requests per hour per API key
- Burst: 500 requests per minute
- Custom limits available

### Rate Limit Headers

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 847
X-RateLimit-Reset: 1635789600
```

### Exceeding Rate Limits

**Response:** `429 Too Many Requests`
```json
{
  "error": {
    "type": "rate_limit_error",
    "message": "Rate limit exceeded. Retry after 3600 seconds.",
    "retry_after": 3600
  }
}
```

**Best Practices:**
- Implement exponential backoff
- Cache responses when possible
- Use webhooks instead of polling
- Batch requests when available

---

## Pagination

### Standard Pagination

**Query Parameters:**
- `page`: Page number (starts at 1)
- `limit`: Items per page (max 100)

**Response:**
```json
{
  "data": [ ... ],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 156,
    "total_pages": 8,
    "has_more": true
  }
}
```

### Cursor-Based Pagination (Coming Soon)

For real-time data and better performance on large datasets.

---

## Filtering & Sorting

### Common Filters

**Date Ranges:**
```
?created_after=2025-01-01&created_before=2025-12-31
```

**Multiple Values:**
```
?status=todo,in_progress&priority=high,urgent
```

**Search:**
```
?q=search+term
```

### Sorting

**Format:** `field:direction`

**Examples:**
```
?sort=created_at:desc
?sort=priority:desc,due_date:asc
```

---

## SDK & Libraries

### Official SDKs

**JavaScript/Node.js:**
```bash
npm install @saasify/api-client
```

**Python:**
```bash
pip install saasify-python
```

**PHP:**
```bash
composer require saasify/api-client
```

### Community Libraries

- Ruby: saasify-ruby (GitHub)
- Go: go-saasify (GitHub)
- .NET: Saasify.NET (NuGet)

---

## Code Examples

### Node.js

```javascript
const Saasify = require('@saasify/api-client');

const client = new Saasify({
  apiKey: 'saas_sk_live_xxx'
});

// List projects
const projects = await client.projects.list({
  status: 'active',
  limit: 50
});

// Create task
const task = await client.tasks.create('proj_abc123', {
  name: 'New task from API',
  assignee_id: 'user_xyz',
  priority: 'high',
  due_date: '2025-11-15T00:00:00Z'
});

// Update task
await client.tasks.update('task_123', {
  status: 'done'
});
```

### Python

```python
from saasify import Client

client = Client(api_key='saas_sk_live_xxx')

# List projects
projects = client.projects.list(status='active', limit=50)

# Create task
task = client.tasks.create(
    project_id='proj_abc123',
    name='New task from API',
    assignee_id='user_xyz',
    priority='high',
    due_date='2025-11-15T00:00:00Z'
)

# Update task
client.tasks.update('task_123', status='done')
```

### cURL

```bash
# List projects
curl https://api.saasify.com/v1/projects \
  -H "Authorization: Bearer saas_sk_live_xxx"

# Create task
curl https://api.saasify.com/v1/projects/proj_abc123/tasks \
  -H "Authorization: Bearer saas_sk_live_xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New task from API",
    "priority": "high",
    "status": "todo"
  }'
```

---

## Testing

### Test Mode

Use test API keys for development:
- Prefix: `saas_sk_test_xxx`
- Separate test workspace
- No charges applied
- Reset data anytime

### Postman Collection

Download our Postman collection:
- [saasify.com/api/postman](https://saasify.com/api/postman)
- Pre-configured requests
- Example responses
- Environment templates

---

## Changelog

**v1.2.0** (2025-11-01):
- Added webhook support
- New filtering options
- Performance improvements

**v1.1.0** (2025-09-15):
- File upload API
- Batch operations
- Enhanced error messages

**v1.0.0** (2025-06-01):
- Initial API release
- Core endpoints
- Authentication

---

## Support

**Documentation:** [docs.saasify.com/api](https://docs.saasify.com/api)

**API Status:** [status.saasify.com](https://status.saasify.com)

**Questions:** api-support@saasify.com

**Community:** [community.saasify.com/api](https://community.saasify.com/api)
