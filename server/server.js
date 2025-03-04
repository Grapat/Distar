require("dotenv").config(); // ✅ Ensure env loads first

const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");

// Import Middleware
const errorMiddleware = require("./middleware/errorMiddleware");
const requestLogger = require("./middleware/requestLogger");
const rateLimiter = require("./middleware/rateLimiter");

<<<<<<< HEAD
// Import Routes
const authRoutes = require("./routes/authRoutes");
const vegRoutes = require("./routes/vegRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const orderRoutes = require("./routes/orderRoutes");
const cartRoutes = require("./routes/cartRoutes");


dotenv.config();

const app = express();
=======
const app = express();

// ✅ PostgreSQL Connection (Ensure Docker is Running)
const pool = new Pool({
    user: process.env.DB_USER || "postgres",
    host: process.env.DB_HOST || "localhost",
    database: process.env.DB_NAME || "your_database_name",
    password: process.env.DB_PASSWORD || "your_database_password",
    port: process.env.DB_PORT || 54321, // Default PostgreSQL port
});
>>>>>>> 6d2b6d2 (loveYou)

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

// ✅ Google OAuth Strategy (Use Full Callback URL)
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
        },
        async (accessToken, refreshToken, profile, done) => {
            const { email, name, picture } = profile._json;

            try {
                const userQuery = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
                let user = userQuery.rows[0];

                if (!user) {
                    // If user doesn't exist, create a new one
                    const insertUser = await pool.query(
                        "INSERT INTO users (email, name, profile_pic, user_type) VALUES ($1, $2, $3, 'user') RETURNING *",
                        [email, name, picture]
                    );
                    user = insertUser.rows[0];
                }

                done(null, user);
            } catch (error) {
                done(error, null);
            }
        }
    )
);

// Serialize & Deserialize User
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
        done(null, user.rows[0]);
    } catch (err) {
        done(err, null);
    }
});

// 🚀 API Routes
app.use("/api/auth", authRoutes);
app.use("/api/vegs", vegRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);

// 🔑 Google OAuth Routes
app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get(
    "/api/auth/google/callback",
    passport.authenticate("google", { session: false }),
    (req, res) => {
        if (!req.user) {
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=OAuth failed`);
        }

        const user = req.user;
        const token = jwt.sign(
            { userId: user.id, userType: user.user_type },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.redirect(`${process.env.FRONTEND_URL}/auth-success?token=${token}`);
    }
);

// 🛑 Error Handling Middleware (must be at the end)
app.use(errorMiddleware);

// 🌍 Handle unknown routes (serve frontend)
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

// 🛑 Error Handling Middleware (ต้องใส่ท้ายสุด)
app.use(errorMiddleware);

// ✅ Start Server
const PORT = process.env.PORT || 4005;
app.listen(PORT, () => {
    console.log(`🚀 Server running on ${process.env.BACKEND_URL || `http://localhost:${PORT}`}`);
});
