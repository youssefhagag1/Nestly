# Nestly

A full-stack web application built with React, Node.js, Express, and MongoDB.

## Features

- User authentication and authorization (JWT + refresh tokens)
- Room management with join codes and role-based access (father/son)
- Task assignment, submission, and review workflow
- **Nesta feed** — anonymous social posting with upvote/downvote system
  - Sort modes: top (by score), new (by date), controversial (by total votes)
  - Full-text search via MongoDB text index
  - Image uploads (up to 5 per post) with Sharp optimization
- **Comments** on Nestas with pagination and editing
- **Notifications** — event-driven notification system
  - Room join requests and approvals
  - Task assignments
  - Submission reviews (approved, rejected, needs_fix)
  - New comments on Nestas
  - Mark as read / mark all read / delete
- File upload functionality with Multer and Sharp image processing
- Secure backend with helmet, express-validator, rate limiting, mongo-sanitize, and XSS protection

## Tech Stack

### Frontend
- React 19
- Vite
- Tailwind CSS 4
- React Router DOM
- Axios

### Backend
- Node.js
- Express 5
- MongoDB with Mongoose
- JWT authentication with refresh tokens
- bcryptjs for password hashing
- Multer for file uploads
- Nodemailer for emails
- QR Code generation
- Sharp for image processing
- express-validator for input validation
- express-rate-limit for rate limiting

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

```bash
git clone https://github.com/youssefhagag1/Nestly.git
cd Nestly
npm install
npm install --prefix Client
npm install --prefix Server
```

Create `Server/config.env`:
```env
NODE_ENV=development
PORT=8000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRE=7d
BASE_URL=http://localhost:8000
EMAIL_HOST=your_email_host
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

```bash
npm run dev        # Run both client + server
npm run server     # Server only
npm run client     # Client only
```

---

# 📘 Full API Documentation

> **Base URL:** `http://localhost:8000/api/v1`  
> **Content-Type:** `application/json` (except file uploads use `multipart/form-data`)  
> **Auth:** Most endpoints require `Authorization: Bearer <token>` header

---

## 🔐 Authentication

### POST /api/v1/auth/register

Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "01012345678",
  "password": "password123",
  "age": 25,
  "gender": "male",
  "country": "Egypt",
  "role": "parent"
}
```

**Validation Rules:**
| Field | Type | Rules |
|-------|------|-------|
| name | String | 2-50 chars, required |
| email | String | Valid email, required |
| phone | String | Unique, required |
| password | String | 6+ chars, required |
| age | Number | 1-100, required |
| gender | String | `male` or `female`, required |
| country | String | Required |
| role | String | `parent` or `child`, required |

**Success Response (201):**
```json
{
  "success": true,
  "user": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "01012345678",
    "age": 25,
    "gender": "male",
    "country": "Egypt",
    "role": "parent",
    "isVerified": false,
    "bio": "",
    "image": "",
    "_id": "664f...",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG..."
}
```

---

### POST /api/v1/auth/login

Authenticate and receive JWT tokens.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "_id": "664f...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "parent"
  },
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG..."
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

### POST /api/v1/auth/refresh-token

Refresh an expired access token using a valid refresh token (sent via cookie `refreshToken`).

**Cookies Required:** `refreshToken` (httpOnly)

**Success Response (200):**
```json
{
  "success": true,
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG..."
}
```

---

### POST /api/v1/auth/logout

Logout by clearing auth cookies.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### GET /api/v1/auth/verify-email/:token

Verify email address via token from email.

**URL Params:** `token` — Email verification token

**Success Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

---

### POST /api/v1/auth/resend-verification

Resend email verification email.

**Auth:** Required

**Success Response (200):**
```json
{
  "success": true,
  "message": "Verification email sent"
}
```

---

### POST /api/v1/auth/forgot-password

Send password reset code to email.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Reset code sent to email"
}
```

---

### PATCH /api/v1/auth/reset-password/:token

Reset password with token from email.

**URL Params:** `token` — Password reset token

**Request Body:**
```json
{
  "password": "newPassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

### 2FA Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/auth/2fa/status` | ✅ | Get 2FA enabled/disabled status |
| POST | `/api/v1/auth/2fa/enable` | ✅ | Enable 2FA (body: `{ "password": "..." }`) |
| POST | `/api/v1/auth/2fa/disable` | ✅ | Disable 2FA (body: `{ "password": "..." }`) |
| POST | `/api/v1/auth/2fa/verify` | ❌ | Verify 2FA token (body: `{ "email": "...", "token": "..." }`) |

---

## 👤 Profile

All profile endpoints require authentication.

### GET /api/v1/profile/me

Get the authenticated user's profile.

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "_id": "664f...",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "01012345678",
    "age": 25,
    "gender": "male",
    "country": "Egypt",
    "role": "parent",
    "bio": "",
    "image": "",
    "isVerified": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### PATCH /api/v1/profile/me

Update profile fields.

**Request Body (partial update):**
```json
{
  "name": "John Updated",
  "bio": "A short bio about me",
  "country": "UAE"
}
```

**Allowed Fields:** `name`, `age`, `gender`, `country`, `phone`, `bio`

**Success Response (200):**
```json
{
  "success": true,
  "user": { "...updated user..." }
}
```

---

### PATCH /api/v1/profile/me/image

Upload/update profile image.

**Content-Type:** `multipart/form-data`
**Field:** `image` (single file, image only)

**Success Response (200):**
```json
{
  "success": true,
  "user": { "...user with new image URL..." }
}
```

---

### DELETE /api/v1/profile/me/image

Delete profile image.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile image deleted successfully"
}
```

---

### PATCH /api/v1/profile/change-password

Change account password.

**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### DELETE /api/v1/profile/me

Delete account permanently.

**Request Body:**
```json
{
  "password": "myPassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

---

## 🏠 Rooms

All room endpoints require authentication.

### POST /api/v1/rooms

Create a new room. The creator becomes the **father**.

**Request Body:**
```json
{
  "name": "Study Group",
  "description": "A room for studying"
}
```

**Validation Rules:**
| Field | Type | Rules |
|-------|------|-------|
| name | String | 2-50 chars, required |
| description | String | Max 200 chars, optional |

**Success Response (201):**
```json
{
  "success": true,
  "room": {
    "_id": "664f...",
    "name": "Study Group",
    "description": "A room for studying",
    "fatherId": "664f...",
    "joinCode": "a3f9c2",
    "image": "",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### POST /api/v1/rooms/join

Join a room using its join code. Status is set to `pending` until approved by father.

**Request Body:**
```json
{
  "joinCode": "a3f9c2"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Request sent to father",
  "member": {
    "roomId": "664f...",
    "userId": "664f...",
    "roleInRoom": "son",
    "status": "pending",
    "_id": "664f..."
  }
}
```

**Notification Triggered:** Father receives `room_invite` notification.

---

### GET /api/v1/rooms/my-rooms

Get all rooms the current user is a member of (approved only).

**Success Response (200):**
```json
{
  "success": true,
  "count": 2,
  "rooms": [
    {
      "_id": "664f...",
      "roomId": {
        "_id": "664f...",
        "name": "Study Group",
        "fatherId": "664f...",
        "joinCode": "a3f9c2",
        "image": ""
      },
      "roleInRoom": "son",
      "status": "approved",
      "joinedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### GET /api/v1/rooms/:roomId

Get room details.

**Success Response (200):**
```json
{
  "success": true,
  "room": {
    "_id": "664f...",
    "name": "Study Group",
    "description": "A room for studying",
    "fatherId": "664f...",
    "joinCode": "a3f9c2",
    "image": "",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### PATCH /api/v1/rooms/:roomId

Update room (father only).

**Request Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Room updated successfully",
  "room": { "...updated room..." }
}
```

---

### DELETE /api/v1/rooms/:roomId

Delete room and all its members (father only, transactional).

**Success Response (200):**
```json
{
  "success": true,
  "message": "Room deleted successfully"
}
```

---

### PATCH /api/v1/rooms/:roomId/image

Upload/update room image (father only).

**Content-Type:** `multipart/form-data`
**Field:** `image` (single file, image only)

**Success Response (200):**
```json
{
  "success": true,
  "room": { "...room with image URL..." }
}
```

---

### DELETE /api/v1/rooms/:roomId/image

Delete room image (father only).

**Success Response (200):**
```json
{
  "success": true,
  "message": "Room image deleted successfully"
}
```

---

### GET /api/v1/rooms/:roomId/members

Get members of a room. Optional `?status=pending|approved|rejected` filter.

**Query Params:** `?status=approved` (optional)

**Success Response (200):**
```json
{
  "success": true,
  "count": 3,
  "members": [
    {
      "_id": "664f...",
      "roomId": "664f...",
      "userId": {
        "_id": "664f...",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "parent"
      },
      "roleInRoom": "father",
      "status": "approved"
    }
  ]
}
```

---

### PATCH /api/v1/rooms/members/status

Approve or reject a join request (father only).

**Request Body:**
```json
{
  "memberId": "664f...",
  "status": "approved"
}
```

**Status Values:** `approved`, `rejected`

**Success Response (200):**
```json
{
  "success": true,
  "member": { "...updated member..." }
}
```

**Notification Triggered:** If `approved`, the son receives `room_invite` notification.

---

### DELETE /api/v1/rooms/:roomId/members/:userId

Remove a member from the room (father only).

**Success Response (200):**
```json
{
  "success": true,
  "message": "Member removed successfully"
}
```

---

### POST /api/v1/rooms/:roomId/leave

Leave a room (son only, father cannot leave).

**Success Response (200):**
```json
{
  "success": true,
  "message": "Left room successfully"
}
```

---

## 📋 Tasks

All task endpoints require authentication.

### POST /api/v1/rooms/:roomId/tasks

Create a new task (father only).

**Content-Type:** `multipart/form-data`

| Field | Type | Rules |
|-------|------|-------|
| title | String | 2-100 chars, required |
| description | String | Max 500 chars, optional |
| assignedTo | String (MongoID) | Required |
| dueDate | String (ISO date) | Optional |
| images | File[] | Up to 5 images, optional |

**Success Response (201):**
```json
{
  "success": true,
  "task": {
    "_id": "664f...",
    "roomId": "664f...",
    "title": "Complete Homework",
    "description": "Solve chapter 5 problems",
    "assignedTo": "664f...",
    "createdBy": "664f...",
    "status": "pending",
    "dueDate": "2024-02-01T00:00:00.000Z",
    "attachments": [
      "http://localhost:8000/uploads/tasks/uuid.jpeg"
    ],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Notification Triggered:** Assigned user receives `task_assigned` notification.

---

### GET /api/v1/rooms/:roomId/tasks

Get tasks for a room (paginated, filterable).

**Query Params:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | Number | 1 | Page number |
| limit | Number | 10 | Items per page |
| status | String | — | Filter by status: `pending`, `submitted`, `completed`, `rejected` |
| sort | String | `-createdAt` | Sort field (prefix `-` for desc): `createdAt`, `dueDate`, `title` |

**Success Response (200):**
```json
{
  "success": true,
  "pagination": {
    "currentPage": 1,
    "itemsPerPage": 10,
    "totalPages": 1,
    "totalItems": 3,
    "hasNextPage": false,
    "hasPrevPage": false
  },
  "data": [
    {
      "_id": "664f...",
      "roomId": "664f...",
      "title": "Complete Homework",
      "assignedTo": { "_id": "664f...", "name": "John Doe" },
      "createdBy": { "_id": "664f...", "name": "Father" },
      "status": "pending"
    }
  ]
}
```

---

### GET /api/v1/tasks/my-tasks

Get tasks assigned to the current user (paginated).

**Query Params:** Same as above (`page`, `limit`, `status`, `sort`)

**Success Response (200):**
```json
{
  "success": true,
  "pagination": { "... pagination meta ..." },
  "data": [ "... tasks ..." ]
}
```

---

### GET /api/v1/rooms/:roomId/tasks/:taskId

Get a single task by ID.

**Success Response (200):**
```json
{
  "success": true,
  "task": { "... full task object ..." }
}
```

---

### PATCH /api/v1/rooms/:roomId/tasks/:taskId

Update a task (father only, can also change assignment).

**Content-Type:** `multipart/form-data`

**Fields:** `title`, `description`, `assignedTo`, `dueDate`, `images` (replaces attachments)

**Success Response (200):**
```json
{
  "success": true,
  "task": { "... updated task ..." }
}
```

---

### DELETE /api/v1/rooms/:roomId/tasks/:taskId

Delete a task (father only).

**Success Response (200):**
```json
{
  "success": true,
  "message": "Task deleted"
}
```

---

## 📤 Submissions

All submission endpoints require authentication.

### POST /api/v1/tasks/:taskId/submissions

Submit work for a task (assigned user only).

**Content-Type:** `multipart/form-data`

| Field | Type | Rules |
|-------|------|-------|
| images | File[] | Required, up to 5 images |
| note | String | Max 300 chars, optional |

**Success Response (201):**
```json
{
  "success": true,
  "submission": {
    "_id": "664f...",
    "taskId": "664f...",
    "submittedBy": "664f...",
    "images": ["http://localhost:8000/uploads/submissions/uuid.jpeg"],
    "note": "Here's my work",
    "status": "pending",
    "review": {
      "comment": "",
      "reviewedBy": null,
      "reviewedAt": null
    },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Notification Triggered:** Father receives `submission_reviewed` notification.

---

### GET /api/v1/tasks/:taskId/submissions

Get all submissions for a task (assigned user or father).

**Success Response (200):**
```json
{
  "success": true,
  "count": 1,
  "submissions": [
    {
      "_id": "664f...",
      "taskId": "664f...",
      "submittedBy": { "_id": "664f...", "name": "John", "email": "john@..." },
      "images": ["http://localhost:8000/uploads/submissions/uuid.jpeg"],
      "note": "Here's my work",
      "status": "pending",
      "review": {
        "comment": "",
        "reviewedBy": null,
        "reviewedAt": null
      }
    }
  ]
}
```

---

### GET /api/v1/tasks/:taskId/submissions/:submissionId

Get a single submission's details.

**Success Response (200):**
```json
{
  "success": true,
  "submission": { "... full submission object ..." }
}
```

---

### PATCH /api/v1/submissions/:submissionId/review

Review a submission (father only).

**Request Body:**
```json
{
  "status": "approved",
  "comment": "Great work!"
}
```

**Status Values:** `approved`, `rejected`, `needs_fix`

**Success Response (200):**
```json
{
  "success": true,
  "submission": {
    "...",
    "status": "approved",
    "review": {
      "comment": "Great work!",
      "reviewedBy": "664f...",
      "reviewedAt": "2024-01-02T00:00:00.000Z"
    }
  }
}
```

**Notification Triggered:** Son receives one of:
- `submission_approved`
- `submission_rejected`
- `submission_needs_fix`

---

### POST /api/v1/tasks/:taskId/submissions/:submissionId/resubmit

Resubmit work after being marked as `needs_fix`. Replaces images, resets status to `pending`, clears review.

**Preconditions:**
- Submission status must be `needs_fix`
- Only the assigned user can resubmit

**Content-Type:** `multipart/form-data`

| Field | Type | Rules |
|-------|------|-------|
| images | File[] | Required, up to 5 images (replaces old ones) |
| note | String | Max 300 chars, optional |

**Success Response (200):**
```json
{
  "success": true,
  "submission": {
    "...",
    "images": ["http://localhost:8000/uploads/submissions/new-uuid.jpeg"],
    "status": "pending",
    "review": {
      "comment": "",
      "reviewedBy": null,
      "reviewedAt": null
    }
  }
}
```

---

### DELETE /api/v1/tasks/:taskId/submissions/:submissionId

Delete a submission. Owner can delete before review; father can delete anytime.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Submission deleted successfully"
}
```

---

## 💬 Nestas (Social Feed)

All nesta endpoints require authentication.

### POST /api/v1/nestas

Create a new nesta post.

**Content-Type:** `multipart/form-data`

| Field | Type | Rules |
|-------|------|-------|
| content | String | 1-1000 chars, required |
| isAnonymous | Boolean | Optional, default: `false` |
| images | File[] | Up to 5 images, optional |

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "664f...",
    "author": {
      "_id": "664f...",
      "name": "John Doe",
      "email": "john@...",
      "image": ""
    },
    "content": "Hello world!",
    "isAnonymous": false,
    "images": ["http://localhost:8000/uploads/nestas/uuid.jpeg"],
    "upVotes": [],
    "downVotes": [],
    "totalUpVotes": 0,
    "totalDownVotes": 0,
    "score": 0,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

> **Note:** When `isAnonymous: true`, the `author` field becomes the string `"Anonymous"`.

---

### GET /api/v1/nestas

Get the nesta feed with pagination and sort modes.

**Query Params:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | Number | 1 | Page number |
| limit | Number | 10 | Items per page |
| sort | String | `new` | Sort mode: `new`, `top`, `controversial` |

**Sort Modes:**
| Mode | Description |
|------|-------------|
| `new` | Most recent first (createdAt descending) |
| `top` | Highest score first (`upVotes - downVotes`) |
| `controversial` | Most total voting activity first (`upVotes + downVotes`) |

**Success Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "664f...",
      "author": { "name": "John Doe", ... },
      "content": "Hello world!",
      "isAnonymous": false,
      "images": [],
      "totalUpVotes": 5,
      "totalDownVotes": 1,
      "score": 4,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "itemsPerPage": 10,
    "totalPages": 1,
    "totalItems": 2,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

---

### GET /api/v1/nestas/search?q=

Search nestas by content using MongoDB full-text search.

**Query Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| q | String | ✅ | Search term (min 2 chars) |
| page | Number | ❌ | Page number (default: 1) |
| limit | Number | ❌ | Items per page (default: 10) |

**Success Response (200):**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "664f...",
      "author": { "...author info..." },
      "content": "Learning MongoDB text search!",
      "score": 2,
      "totalUpVotes": 3,
      "totalDownVotes": 1,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": { "... pagination meta ..." }
}
```

**Empty Query Response (200):**
```json
{
  "success": true,
  "count": 0,
  "data": [],
  "pagination": {
    "currentPage": 1,
    "itemsPerPage": 10,
    "totalPages": 0,
    "totalItems": 0,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

---

### GET /api/v1/nestas/me

Get the current user's nestas with pagination.

**Query Params:** `page`, `limit`, `sort` (supports `createdAt`, `-createdAt`, `score`, `-score`, `totalUpVotes`, `-totalUpVotes`)

**Success Response (200):**
```json
{
  "success": true,
  "count": 3,
  "data": [ "... nestas ..." ],
  "pagination": { "... pagination meta ..." }
}
```

---

### GET /api/v1/users/:userId/nestas

Get a specific user's nestas with pagination.

**Query Params:** Same as `/me` endpoint.

**Success Response (200):**
```json
{
  "success": true,
  "count": 5,
  "data": [ "... nestas ..." ],
  "pagination": { "... pagination meta ..." }
}
```

---

### GET /api/v1/nestas/:id

Get a single nesta by ID.

**Success Response (200):**
```json
{
  "success": true,
  "data": { "... full nesta object ..." }
}
```

---

### PATCH /api/v1/nestas/:id

Update a nesta post (owner only).

**Content-Type:** `multipart/form-data`

**Fields:** `content` (string, max 1000), `isAnonymous` (boolean), `images` (replaces existing)

**Success Response (200):**
```json
{
  "success": true,
  "data": { "... updated nesta ..." }
}
```

---

### DELETE /api/v1/nestas/:id

Delete a nesta post (owner only).

**Success Response (200):**
```json
{
  "success": true,
  "message": "Nesta deleted successfully"
}
```

---

### PATCH /api/v1/nestas/:id/upvote

Upvote a nesta post. Toggles: if already upvoted → error. If had downvote → removes downvote first.

**Success Response (200):**
```json
{
  "success": true,
  "data": { "... nesta with updated votes ..." }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "You have already upvoted this post"
}
```

---

### PATCH /api/v1/nestas/:id/downvote

Downvote a nesta post. Same toggle behavior as upvote.

**Success Response (200):**
```json
{
  "success": true,
  "data": { "... nesta with updated votes ..." }
}
```

---

## 💭 Comments

All comment endpoints require authentication.

### POST /api/v1/nestas/:nestaId/comments

Add a comment to a nesta.

**Request Body:**
```json
{
  "content": "Great post!",
  "isAnonymous": false
}
```

**Validation Rules:**
| Field | Type | Rules |
|-------|------|-------|
| content | String | 1-500 chars, required |
| isAnonymous | Boolean | Optional, default: `false` |

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "664f...",
    "nestaId": "664f...",
    "user": {
      "_id": "664f...",
      "name": "John Doe",
      "email": "john@...",
      "image": ""
    },
    "content": "Great post!",
    "isAnonymous": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

> **Note:** When `isAnonymous: true`, `user` becomes `"Anonymous"`.
> **Notification:** The nesta author receives a `comment_added` notification (unless they commented on their own post).

---

### GET /api/v1/nestas/:nestaId/comments

Get comments for a nesta (paginated).

**Query Params:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | Number | 1 | Page number |
| limit | Number | 10 | Items per page |
| sort | String | `-createdAt` | Sort field (`createdAt`, `-createdAt`) |

**Success Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "664f...",
      "nestaId": "664f...",
      "user": { "name": "Jane", "email": "jane@...", "image": "" },
      "content": "Nice!",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": { "... pagination meta ..." }
}
```

---

### PATCH /api/v1/nestas/:nestaId/comments/:commentId

Edit a comment (owner only).

**Request Body:**
```json
{
  "content": "Updated comment text"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "...",
    "content": "Updated comment text",
    "editedAt": "2024-01-02T00:00:00.000Z"
  }
}
```

> **Note:** The `editedAt` field is automatically set when a comment is edited.

---

### DELETE /api/v1/nestas/:nestaId/comments/:commentId

Delete a comment (owner only).

**Success Response (200):**
```json
{
  "success": true,
  "message": "Comment deleted successfully"
}
```

---

## 🔔 Notifications

All notification endpoints require authentication.

### GET /api/v1/notifications

Get notifications for the current user (paginated, filterable).

**Query Params:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | Number | 1 | Page number |
| limit | Number | 20 | Items per page |
| isRead | String | — | Filter: `"true"` (read), `"false"` (unread), omit for all |

**Success Response (200):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "664f...",
      "recipient": "664f...",
      "type": "task_assigned",
      "title": "New Task Assigned",
      "message": "You've been assigned a new task: \"Complete Homework\"",
      "relatedId": "664f...",
      "relatedModel": "Task",
      "isRead": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": { "... pagination meta ..." }
}
```

**Notification Types:**
| Type | Title | Trigger |
|------|-------|---------|
| `room_invite` | "New Join Request" | Son requests to join room |
| `room_invite` | "Join Request Approved" | Father approves join |
| `task_assigned` | "New Task Assigned" | Father creates/updates a task |
| `submission_reviewed` | "New Submission" | Son submits work |
| `submission_approved` | "Submission Approved" | Father approves |
| `submission_rejected` | "Submission Rejected" | Father rejects |
| `submission_needs_fix` | "Submission Needs Fixes" | Father marks needs_fix |
| `comment_added` | "New Comment" | Someone comments on nesta |

---

### PATCH /api/v1/notifications/:id/read

Mark a single notification as read.

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "664f...",
    "isRead": true,
    "... rest of notification ..."
  }
}
```

---

### PATCH /api/v1/notifications/read-all

Mark all unread notifications as read.

**Success Response (200):**
```json
{
  "success": true,
  "modifiedCount": 3,
  "message": "Marked 3 notification(s) as read"
}
```

---

### DELETE /api/v1/notifications/:id

Delete a notification.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

---

## 🔄 Automatic Notifications Reference

| # | Event | Trigger | Recipient | Type |
|---|-------|---------|-----------|------|
| 1 | Room join request | `POST /api/v1/rooms/join` | Father | `room_invite` |
| 2 | Room join approved | `PATCH /api/v1/rooms/members/status` (status=approved) | Son | `room_invite` |
| 3 | New task assigned | `POST /api/v1/rooms/:roomId/tasks` | Assigned user | `task_assigned` |
| 4 | Submission created | `POST /api/v1/tasks/:taskId/submissions` | Father | `submission_reviewed` |
| 5 | Submission approved | `PATCH /api/v1/submissions/:submissionId/review` (status=approved) | Son | `submission_approved` |
| 6 | Submission rejected | `PATCH /api/v1/submissions/:submissionId/review` (status=rejected) | Son | `submission_rejected` |
| 7 | Submission needs fix | `PATCH /api/v1/submissions/:submissionId/review` (status=needs_fix) | Son | `submission_needs_fix` |
| 8 | New comment on nesta | `POST /api/v1/nestas/:nestaId/comments` | Nesta author | `comment_added` |

---

## 📁 Project Structure

```
Nestly/
├── Client/                          # Frontend React application
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── utils/
│   │   └── ...
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── .gitignore
├── Server/                          # Backend Express server
│   ├── config/                      # Database configuration
│   ├── controllers/                 # Route handlers (8 files)
│   ├── middlewares/                  # Express middlewares (4 files)
│   ├── models/                      # Mongoose schemas (8 files)
│   ├── routes/                      # Express routers (8 files)
│   ├── services/                    # Business logic layer (5 files)
│   ├── uploads/                     # Image storage (5 subdirs)
│   ├── Utils/                       # Helper utilities (5 files)
│   ├── validators/                  # Request validation (8 files)
│   ├── index.js
│   ├── package.json
│   └── config.env
├── package.json
└── .gitignore
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

ISC License

## Author

Youssef Hagag