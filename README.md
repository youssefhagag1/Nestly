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
- **Notifications** — real-time event-driven notification system
  - Room join requests and approvals
  - Task assignments
  - Submission reviews (approved, rejected, needs_fix)
  - New comments on Nestas
  - Mark as read / mark all read / delete
- File upload functionality with Multer and Sharp image processing
- Responsive UI with Tailwind CSS
- Secure backend with helmet, express-validator, rate limiting, mongo-sanitize, and XSS protection
- MongoDB database integration with optimized indexes

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

Before running this application, make sure you have the following installed:

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/youssefhagag1/Nestly.git
cd Nestly
```

2. Install root dependencies:
```bash
npm install
```

3. Install client dependencies:
```bash
npm install --prefix Client
```

4. Install server dependencies:
```bash
npm install --prefix Server
```

5. Set up environment variables:

Create a `config.env` file in the `Server` directory:
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

## Usage

### Development Mode

Run both client and server concurrently:
```bash
npm run dev
```

Or run them separately:

Terminal 1 - Start the server:
```bash
npm run server
```

Terminal 2 - Start the client:
```bash
npm run client
```

### Client Only
```bash
npm run client
```

### Server Only
```bash
npm run server
```

## Available Scripts

### Root Level
- `npm run dev` - Run both client and server in development mode
- `npm run client` - Run the client development server
- `npm run server` - Run the server development server

### Client
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Server
- `npm run dev` - Start development server with nodemon

## Project Structure

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
│   ├── controllers/                 # Route handlers
│   │   ├── authController.js
│   │   ├── roomController.js
│   │   ├── taskController.js
│   │   ├── submissionController.js
│   │   ├── nestaController.js
│   │   ├── commentController.js
│   │   ├── notificationController.js
│   │   └── profileController.js
│   ├── middlewares/                 # Express middlewares
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   ├── uploadImageMiddleware.js
│   │   └── validatorMiddleware.js
│   ├── models/                      # Mongoose schemas
│   │   ├── userModel.js
│   │   ├── roomModel.js
│   │   ├── roomMemberModel.js
│   │   ├── taskModel.js
│   │   ├── submissionModel.js
│   │   ├── nestaModel.js
│   │   ├── commentModel.js
│   │   └── notificationModel.js
│   ├── routes/                      # Express routers
│   │   ├── authRouter.js
│   │   ├── roomRoutes.js
│   │   ├── taskRoutes.js
│   │   ├── submissionRoutes.js
│   │   ├── nestaRoutes.js
│   │   ├── commentRoutes.js
│   │   ├── notificationRoutes.js
│   │   └── profileRoutes.js
│   ├── services/                    # Business logic layer
│   │   ├── paginationService.js
│   │   ├── nestaService.js
│   │   ├── commentService.js
│   │   ├── submissionService.js
│   │   └── notificationService.js
│   ├── uploads/                     # Image storage
│   │   ├── users/
│   │   ├── tasks/
│   │   ├── submissions/
│   │   ├── nestas/
│   │   └── rooms/
│   ├── Utils/                       # Helper utilities
│   │   ├── apiError.js
│   │   ├── hashToken.js
│   │   ├── imageProcessing.js
│   │   ├── sendEmail.js
│   │   └── tokens.js
│   ├── validators/                  # Request validation
│   │   ├── authValidator.js
│   │   ├── roomValidator.js
│   │   ├── taskValidator.js
│   │   ├── submissionValidator.js
│   │   ├── nestaValidator.js
│   │   ├── commentValidator.js
│   │   ├── notificationValidator.js
│   │   └── profileValidator.js
│   ├── index.js
│   ├── package.json
│   └── config.env
├── package.json                     # Root package.json
├── package-lock.json
└── .gitignore
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/signup` | Register a new user |
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/forgotPassword` | Request password reset email |
| POST | `/api/v1/auth/verifyResetCode` | Verify password reset code |
| PATCH | `/api/v1/auth/resetPassword` | Reset password |
| POST | `/api/v1/auth/refresh` | Refresh access token |

### Rooms
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/rooms` | Create a room (user becomes father) |
| GET | `/api/v1/rooms/me` | Get my joined rooms |
| POST | `/api/v1/rooms/join` | Join a room with code (status: pending) |
| GET | `/api/v1/rooms/:roomId` | Get room details |
| PATCH | `/api/v1/rooms/:roomId` | Update room (father only) |
| DELETE | `/api/v1/rooms/:roomId` | Delete room with all members (father only) |
| PATCH | `/api/v1/rooms/:roomId/image` | Upload/update room image (father only) |
| DELETE | `/api/v1/rooms/:roomId/image` | Delete room image (father only) |
| GET | `/api/v1/rooms/:roomId/members` | List room members (filterable by ?status=) |
| DELETE | `/api/v1/rooms/:roomId/members/:userId` | Remove member (father only) |
| POST | `/api/v1/rooms/:roomId/leave` | Leave room (son only) |
| PATCH | `/api/v1/rooms/:roomId/members/:memberId` | Approve/reject join request (father only) |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/rooms/:roomId/tasks` | Create a task (father only, up to 5 images) |
| GET | `/api/v1/rooms/:roomId/tasks` | Get tasks for a room (paginated, filterable) |
| GET | `/api/v1/tasks/my-tasks` | Get my assigned tasks (paginated) |
| GET | `/api/v1/rooms/:roomId/tasks/:taskId` | Get task by ID |
| PATCH | `/api/v1/rooms/:roomId/tasks/:taskId` | Update task (father only) |
| DELETE | `/api/v1/rooms/:roomId/tasks/:taskId` | Delete task (father only) |

### Submissions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/tasks/:taskId/submissions` | Submit work (up to 5 images) |
| GET | `/api/v1/tasks/:taskId/submissions` | Get submissions for a task |
| GET | `/api/v1/tasks/:taskId/submissions/:submissionId` | Get submission details |
| PATCH | `/api/v1/submissions/:submissionId/review` | Review submission (father only) |
| POST | `/api/v1/tasks/:taskId/submissions/:submissionId/resubmit` | Resubmit after needs_fix (replaces images) |
| DELETE | `/api/v1/tasks/:taskId/submissions/:submissionId` | Delete submission |

### Nestas (Social Feed)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/nestas` | Create a nesta (up to 5 images) |
| GET | `/api/v1/nestas` | Get all nestas (`?sort=top\|new\|controversial`, paginated) |
| GET | `/api/v1/nestas/search?q=` | Search nestas by content (full-text, sorted by relevance) |
| GET | `/api/v1/nestas/me` | Get my nestas (paginated) |
| GET | `/api/v1/users/:userId/nestas` | Get a user's nestas (paginated) |
| GET | `/api/v1/nestas/:id` | Get single nesta |
| PATCH | `/api/v1/nestas/:id` | Update nesta (owner only, up to 5 images) |
| DELETE | `/api/v1/nestas/:id` | Delete nesta (owner only) |
| PATCH | `/api/v1/nestas/:id/upvote` | Upvote a nesta |
| PATCH | `/api/v1/nestas/:id/downvote` | Downvote a nesta |

### Comments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/nestas/:nestaId/comments` | Add a comment |
| GET | `/api/v1/nestas/:nestaId/comments` | Get comments (paginated) |
| PATCH | `/api/v1/nestas/:nestaId/comments/:commentId` | Edit comment (owner only) |
| DELETE | `/api/v1/nestas/:nestaId/comments/:commentId` | Delete comment (owner only) |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/notifications` | Get notifications (`?isRead=true\|false`, paginated) |
| PATCH | `/api/v1/notifications/:id/read` | Mark single notification as read |
| PATCH | `/api/v1/notifications/read-all` | Mark all notifications as read |
| DELETE | `/api/v1/notifications/:id` | Delete a notification |

### Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/profile/me` | Get my profile |
| PATCH | `/api/v1/profile/me` | Update profile |
| PATCH | `/api/v1/profile/image` | Upload/update profile image |
| DELETE | `/api/v1/profile/image` | Delete profile image |

## Query Parameters

Endpoints supporting pagination accept:
- `?page=1` — Page number (default: 1)
- `?limit=10` — Items per page (default varies)

Nesta feed supports:
- `?sort=top` — Sort by score (upvotes - downvotes)
- `?sort=new` — Sort by most recent (default)
- `?sort=controversial` — Sort by total voting activity

## Automatic Notifications

The system automatically creates notifications for these events:

| Event | Trigger | Recipient |
|-------|---------|-----------|
| Room join request | Son joins a room | Father |
| Room approval | Father approves request | Son |
| Task assigned | Father creates/updates task | Assigned son |
| Submission created | Son submits work | Father |
| Submission approved | Father approves | Son |
| Submission rejected | Father rejects | Son |
| Submission needs fix | Father marks needs_fix | Son |
| New comment on nesta | User comments | Nesta author |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Author

Youssef Hagag

## Acknowledgments

- Built with modern web technologies
- Inspired by best practices in full-stack development