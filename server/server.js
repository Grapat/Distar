const express = require("express");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const compression = require("compression");

// Import Middleware
const errorMiddleware = require("./middleware/errorMiddleware");
const requestLogger = require("./middleware/requestLogger");
const rateLimiter = require("./middleware/rateLimiter");

// Import Routes
const authRoutes = require("./routes/authRoutes");

dotenv.config();

const app = express();

// 🛠️ Apply Global Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet());
app.use(compression());
app.use(rateLimiter);
app.use(requestLogger);

// 🌱 Serve Static Files (Vite frontend)
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// 🚀 API Routes
app.use("/api/auth", authRoutes); // ✅ เพิ่ม Authentication Routes

// 🌍 Handle unknown routes
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

// 🛑 Error Handling Middleware (ต้องใส่ท้ายสุด)
app.use(errorMiddleware);

// ✅ Start Server
const PORT = process.env.PORT || 4005;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
