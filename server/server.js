require("dotenv").config(); // ✅ Ensure env loads first

const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { Pool } = require("pg");

// Import Middleware
const errorMiddleware = require("./middleware/errorMiddleware");
const requestLogger = require("./middleware/requestLogger");
const rateLimiter = require("./middleware/rateLimiter");

const app = express();

// ✅ PostgreSQL Connection (Ensure Docker is Running)
const pool = new Pool({
    user: process.env.DB_USERNAME,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

// 🛠️ Apply Global Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet());
app.use(compression());
app.set('trust proxy', 1); // Trust first proxy (for rate limiting)
app.use(rateLimiter);
app.use(requestLogger);

// 🌱 Serve Static Files (Frontend)
//app.use(express.static(path.join(__dirname, "../frontend/dist")));

// 🚀 API Routes
const authRoutes = require("./routes/authRoutes");
const vegRoutes = require("./routes/vegRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const orderRoutes = require("./routes/orderRoutes");
const cartRoutes = require("./routes/cartRoutes");
const userRoutes = require("./routes/userRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/vegs", vegRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/users", userRoutes);

// Error Handling Middleware
app.use(errorMiddleware);

// Handle unknown routes (serve frontend)
/* app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
}); */

// Start Server
const PORT = process.env.PORT || 4005;
app.listen(PORT, () => {
    console.log(`🚀 Server running on ${ `http://localhost:${PORT}`}`);
});