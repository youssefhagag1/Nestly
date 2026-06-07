# Nestly

A feature-rich Node.js backend API built with Express.js and MongoDB, designed to manage users, channels, posts, comments, tasks, and tips.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [File Uploads](#file-uploads)
- [Error Handling](#error-handling)

## Features

- 👤 **User Management** - Register, login, profile management with JWT authentication
- 📢 **Channels** - Create and manage channels
- 📝 **Posts** - Create, update, delete posts with full CRUD operations
- 💬 **Comments** - Add comments to posts
- 👍 **Likes** - Like posts and comments
- ✅ **Tasks** - Create and manage tasks with status tracking
- 💡 **Tips** - Share and manage tips
- 🔐 **Security** - Password hashing with bcryptjs and JWT token-based authentication
- 📁 **File Uploads** - Handle file uploads with multer
- 🌐 **CORS** - Cross-origin resource sharing enabled

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js 5.1.0
- **Database**: MongoDB with Mongoose 8.19.3
- **Authentication**: JWT (jsonwebtoken 9.0.2)
- **Password Hashing**: bcryptjs 3.0.3
- **File Upload**: multer 2.0.2
- **Validation**: express-validation 4.1.1, validator 13.15.20
- **Development**: Nodemon 3.1.10
- **CORS**: cors 2.8.5
- **Environment**: dotenv 17.2.3

## Project Structure

```
Nestly/
├── controllers/          # Business logic for each feature
│   ├── users.controller.js
│   ├── channels.controller.js
│   ├── posts.controller.js
│   ├── comments.controller.js
│   ├── likes.controller.js
│   ├── tasks.controller.js
│   └── tips.controller.js
├── models/              # Mongoose schemas
│   ├── users.model.js
│   ├── channels.model.js
│   ├── posts.model.js
│   └── comments.model.js
├── routers/             # API route definitions
│   ├── users.router.js
│   ├── channels.router.js
│   ├── posts.router.js
│   ├── comments.router.js
│   ├── tasks.router.js
│   └── tips.router.js
├── middelwares/         # Custom middleware
│   ├── verifyToken.js   # JWT token verification
│   ├── allowTo.js       # Role-based authorization
│   └── asyncWrapper.js  # Async error handling
├── Utils/               # Utility functions
│   ├── generateToken.js
│   ├── statusText.js
│   ├── taskStatus.js
│   └── userRole.js
├── uploads/             # File uploads directory
├── server.js            # Express server configuration
├── package.json         # Project dependencies
└── .env                 # Environment variables (not included in repo)
```

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd nestly
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create a `.env` file** in the root directory with the following variables:

   ```env
   MONGO_URL=mongodb://localhost:27017/nestly
   JWT_SECRET=your_jwt_secret_key_here
   PORT=5000
   ```

4. **Ensure MongoDB is running** on your system or using a MongoDB service

## Environment Variables

Create a `.env` file in the root directory:

```env
# Database
MONGO_URL=mongodb://localhost:27017/nestly

# JWT
JWT_SECRET=your_secret_key_here

# Server
PORT=5000
NODE_ENV=development
```

## Usage

### Start the development server

```bash
npm start
```

The server will start with nodemon, which automatically restarts on file changes.

```
> nodemon server.js
[nodemon] 3.1.10
[nodemon] to restart at any time, type `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,json
mongoose connected successfully.
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Users (`/api/users`)

- `POST /register` - Register a new user
- `POST /login` - Login user
- `GET /` - Get all users (requires authentication)
- `GET /:id` - Get user by ID
- `PUT /:id` - Update user profile
- `DELETE /:id` - Delete user account

### Channels (`/api/channels`)

- `POST /` - Create a new channel
- `GET /` - Get all channels
- `GET /:id` - Get channel by ID
- `PUT /:id` - Update channel
- `DELETE /:id` - Delete channel

### Posts (`/api/posts`)

- `POST /` - Create a new post
- `GET /` - Get all posts
- `GET /:id` - Get post by ID
- `PUT /:id` - Update post
- `DELETE /:id` - Delete post

### Comments (`/api/comments`)

- `POST /` - Add comment to post
- `GET /:postId` - Get comments for a post
- `PUT /:id` - Update comment
- `DELETE /:id` - Delete comment

### Likes (`/api/likes`)

- `POST /` - Like a post or comment
- `DELETE /:id` - Unlike a post or comment

### Tasks (`/api/tasks`)

- `POST /` - Create a new task
- `GET /` - Get all tasks
- `GET /:id` - Get task by ID
- `PUT /:id` - Update task status
- `DELETE /:id` - Delete task

### Tips (`/api/tips`)

- `POST /` - Create a new tip
- `GET /` - Get all tips
- `GET /:id` - Get tip by ID
- `PUT /:id` - Update tip
- `DELETE /:id` - Delete tip

## Authentication

The API uses **JWT (JSON Web Tokens)** for authentication:

1. **Register/Login** - Receive a JWT token
2. **Include Token** - Send token in the `Authorization` header:
   ```
   Authorization: Bearer <your_jwt_token>
   ```
3. **Token Verification** - Protected routes verify the token using `verifyToken` middleware

### Example Login Request

```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

Response:

```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## File Uploads

File uploads are handled via the `/uploads` endpoint with authentication required:

```bash
curl -X POST http://localhost:5000/uploads \
  -H "Authorization: Bearer <your_jwt_token>" \
  -F "file=@path/to/file"
```

## Error Handling

The API returns consistent error responses:

```json
{
  "code": 400,
  "status": "fail",
  "message": "Error description",
  "data": null
}
```

Common error statuses:

- `400` - Bad Request / Validation Error
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Resource Not Found
- `500` - Internal Server Error

## Middleware

- **`verifyToken`** - Validates JWT tokens on protected routes
- **`allowTo`** - Role-based access control
- **`asyncWrapper`** - Handles async errors in route handlers
- **`cors`** - Enables CORS for cross-origin requests

## Development

To contribute or modify the project:

1. Install dependencies: `npm install`
2. Start development server: `npm start`
3. The server will automatically restart on file changes

## License

ISC

## Author

Youssef Mohamed

---

For more information or issues, please contact the development team.
