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
    user: process.env.DB_USERNAME || "postgres",
    host: process.env.DB_HOST || "localhost",
    database: process.env.DB_NAME || "your_database_name",
    password: process.env.DB_PASSWORD || "your_database_password",
    port: process.env.DB_PORT || 5432, // Default PostgreSQL port
});

// 🛠️ Apply Global Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet());
app.use(compression());
app.use(rateLimiter);
app.use(requestLogger);

// 🌱 Serve Static Files (Frontend)
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// ✅ Login Route
app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const userQuery = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        const user = userQuery.rows[0];

        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }

        // Compare hashed passwords (Assuming bcrypt is used)
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Generate JWT Token
        const token = jwt.sign(
            { userId: user.id, userType: user.user_type },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({ token, user });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 🚀 API Routes
const authRoutes = require("./routes/authRoutes");
const vegRoutes = require("./routes/vegRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const orderRoutes = require("./routes/orderRoutes");
const cartRoutes = require("./routes/cartRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/vegs", vegRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);

// 🛑 Error Handling Middleware (must be at the end)
app.use(errorMiddleware);

// 🌍 Handle unknown routes (serve frontend)
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

// ✅ Start Server
const PORT = process.env.PORT || 4005;
app.listen(PORT, () => {
    console.log(`🚀 Server running on ${process.env.BACKEND_URL || `http://localhost:${PORT}`}`);
});