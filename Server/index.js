const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require("dotenv");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const databaseConnection = require('./config/database');
dotenv.config({path: './config.env'});
databaseConnection();
const app = express();

// ================= SECURITY MIDDLEWARE =================

// 1. Helmet - Set security HTTP headers
app.use(helmet());

// 2. CORS - Allow cross-origin requests
app.use(cors());

// 3. Rate Limiting - Prevent brute force / DDoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
});
app.use("/api", limiter);

// Stricter rate limit for auth routes (prevent brute force login)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many auth attempts, please try again after 15 minutes",
});
app.use("/api/v1/auth", authLimiter);

// 4. Body parser - Parse JSON with size limit
app.use(express.json({ limit: "10kb" }));

// 5. Cookie parser
app.use(cookieParser());

// 6. Data sanitization against NoSQL injection
app.use(mongoSanitize());

// 7. Data sanitization against XSS
app.use(xss());

// 8. Logger
app.use(morgan("dev"));

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const globalError = require('./middlewares/errorMiddleware');

const authRouter = require("./routes/authRouter");
const roomRoutes = require("./routes/roomRoutes");
const taskRoutes = require("./routes/taskRoutes");
const profileRoutes = require("./routes/profileRoutes");
const nestaRoutes = require("./routes/nestaRoutes");

app.use("/api/v1/auth" , authRouter);
app.use("/api/v1/rooms", roomRoutes);
app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/nestas", nestaRoutes);

app.use(globalError);
const PORT = process.env.PORT || 8000;

const server = app.listen(PORT , () => {
    console.log(`App running on port ${PORT}`)
})


process.on("unhandledRejection" , (err) => {
    console.error("unhandledRejection Error" , err.name , err.message)
    server.close(() => {
        console.error("shutuing down.....")
        process.exit(1);
    })
})