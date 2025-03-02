const express = require("express");
const { getUser, register, login, forgotPassword, resetPassword } = require("../controllers/authController");
const router = express.Router();
const authenticate = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/user", authenticate, getUser); // ✅ เพิ่ม Route ดึงข้อมูลผู้ใช้ที่ล็อกอิน

module.exports = router;
