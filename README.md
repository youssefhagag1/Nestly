# Nestly

A full-stack web application built with React, Node.js, Express, and MongoDB.

## Features

- User authentication and authorization
- RESTful API architecture
- File upload functionality
- Responsive UI with Tailwind CSS
- Secure backend with helmet, express-validator, and rate limiting
- MongoDB database integration

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
- JWT authentication
- bcryptjs for password hashing
- Multer for file uploads
- Nodemailer for emails
- QR Code generation
- Sharp for image processing

## Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (v18 or higher)
- MongoDB
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

Create a `.env` file in the `Server` directory (see `Server/config.env` for reference):
```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
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
├── Client/                 # Frontend React application
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
├── Server/                 # Backend Express server
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── Utils/
│   ├── validators/
│   ├── index.js
│   ├── package.json
│   └── config.env
├── package.json            # Root package.json
├── package-lock.json
└── .gitignore
```

## API Endpoints

The server provides RESTful API endpoints. Check the `Server/routes/` directory for available routes.

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