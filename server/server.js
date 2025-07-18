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

const corsOptions = {
  origin: ["https://distarwebapp.vercel.app", "http://localhost:3000"],
  credentials: true,
};

// ✅ PostgreSQL Connection - Conditional for Local vs. Render
let pool;

// --- DEBUG LOG ---
console.log("Value of process.env.DB_URI:", process.env.DB_URL);
// --- END DEBUG LOG ---

if (process.env.NODE_ENV === "production") {
  // ✅ For Render deployment (or any environment where DB_URI is provided)
  console.log("Using DB_URL for database connection.");
  pool = new Pool({
    connectionString: process.env.DB_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
} else {
  // ✅ For Local Development (or any environment where individual DB variables are used)
  console.log(
    "Using individual DB environment variables for database connection."
  );
  // Log individual variables for debugging local setup if needed
  console.log("DB_USERNAME:", process.env.DB_USERNAME);
  console.log("DB_HOST:", process.env.DB_HOST);
  console.log("DB_PORT:", process.env.DB_PORT);
  console.log("DB_NAME:", process.env.DB_NAME);
  console.log("DB_PASSWORD:", process.env.DB_PASSWORD ? "********" : "Not Set"); // Mask password
  pool = new Pool({
    user: process.env.DB_USERNAME,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    // For local development, SSL might not be needed or might need different settings
    // If you use Docker locally with SSL, you might need to add ssl: { rejectUnauthorized: false } here too
  });
}

pool
  .connect()
  .then((client) => {
    console.log("✅ Connected to PostgreSQL database!");
    client.release();
  })
  .catch((err) => {
    console.error("❌ Error connecting to PostgreSQL database:", err.message);
    // It's good practice to exit if the database connection fails on startup
    process.exit(1);
  });

// 🛠️ Apply Global Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet());
app.use(compression());
app.set("trust proxy", 1); // Trust first proxy (for rate limiting)
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
  console.log(`🚀 Server running on ${`http://localhost:${PORT}`}`);
});
