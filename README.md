# 🚀 Nestly Backend

Backend API for **Nestly**, a family collaboration platform built with **Node.js**, **Express.js**, and **MongoDB**.

It provides authentication, room management, task workflow, anonymous social feed, notifications, image uploads, and secure REST APIs.

---

## ✨ Features

### 🔐 Authentication
- JWT Authentication
- Refresh Tokens
- Email Verification
- Forgot / Reset Password
- Two-Factor Authentication (2FA)
- Secure Password Hashing (bcrypt)

### 👤 User Profile
- View Profile
- Update Profile
- Upload/Delete Profile Image
- Change Password
- Delete Account

### 🏠 Rooms
- Create Rooms
- Join Rooms using Join Code
- Approve / Reject Join Requests
- Manage Members
- Leave Room
- Upload Room Image

### 📋 Tasks
- Create Tasks
- Assign Tasks
- Due Dates
- Image Attachments
- Update/Delete Tasks
- Task Filtering & Pagination

### 📤 Task Submissions
- Submit Task
- Resubmit After Fixes
- Review Submission
- Approve / Reject / Needs Fix
- Image Uploads

### 💬 Nesta Feed
- Anonymous Posts
- Upvote / Downvote
- Full Text Search
- Pagination
- Multiple Sorting Modes
- Image Uploads

### 💭 Comments
- Add Comment
- Anonymous Comments
- Edit/Delete Comments
- Pagination

### 🔔 Notifications
- Room Requests
- Task Assignments
- Submission Reviews
- Comment Notifications
- Mark Read
- Mark All Read

### 🛡 Security
- Helmet
- Rate Limiting
- Mongo Sanitize
- XSS Protection
- Express Validator
- Secure File Uploads
- Image Optimization using Sharp

---

# 🛠 Tech Stack

- Node.js
- Express.js 5
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Multer
- Sharp
- Nodemailer
- QRCode
- Express Validator
- Helmet
- Express Rate Limit
- Mongo Sanitize
- XSS Clean

---

# 📂 Folder Structure

```
Server/
│
├── config/
├── controllers/
├── middlewares/
├── models/
├── routes/
├── services/
├── uploads/
├── Utils/
├── validators/
│
├── index.js
├── package.json
└── config.env
```

---

# ⚙ Requirements

- Node.js >= 18
- MongoDB
- npm

---

# 📦 Installation

Clone the repository

```bash
git clone https://github.com/youssefhagag1/Nestly.git
```

Go to project

```bash
cd Nestly
```

Install dependencies

```bash
npm install
npm install --prefix Server
```

---

# 🔑 Environment Variables

Create

```
Server/config.env
```

```env
NODE_ENV=development

PORT=8000

MONGO_URI=

JWT_SECRET=
JWT_EXPIRE=30d

REFRESH_TOKEN_SECRET=
REFRESH_TOKEN_EXPIRE=7d

JWT_COOKIE_EXPIRE=30

BASE_URL=http://localhost:8000

EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASS=
```

---

# ▶ Running the Server

Development

```bash
npm run server
```

or

```bash
npm run dev
```

Server runs on

```
http://localhost:8000
```

---

# 📚 API

Base URL

```
http://localhost:8000/api/v1
```

Authentication

```
Authorization: Bearer <access_token>
```

Content Types

```
application/json
```

For uploads

```
multipart/form-data
```

---

# 📖 API Modules

- Authentication
- Profile
- Rooms
- Tasks
- Submissions
- Nesta Feed
- Comments
- Notifications

---

# 📸 File Uploads

Supported uploads

- Profile Images
- Room Images
- Task Images
- Submission Images
- Nesta Images

Maximum images per request

```
5 Images
```

All uploaded images are automatically optimized using **Sharp**.

---

# 🔒 Security

The backend includes:

- JWT Authentication
- Refresh Tokens
- Password Hashing
- Email Verification
- Rate Limiting
- XSS Protection
- Mongo Injection Protection
- Input Validation
- Secure HTTP Headers

---

# 🚀 Future Improvements

- WebSockets for Realtime Notifications
- Push Notifications
- Redis Caching
- Docker Support
- CI/CD Pipeline
- Unit & Integration Tests

---

# 👨‍💻 Author

**Youssef Hagag**

GitHub

https://github.com/youssefhagag1

---

# 📄 License

ISC