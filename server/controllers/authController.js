const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const nodemailer = require("nodemailer");
require("dotenv").config();

// 📝 Register (ลงทะเบียน)
const register = async (req, res) => {
  try {
    const { name, email, password, phone, address, user_type } = req.body;

    // เช็คว่ามีอีเมลนี้อยู่แล้วหรือไม่
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser)
      return res.status(400).json({ message: "Email already in use." });

    // เข้ารหัสรหัสผ่าน
    const hashedPassword = await bcrypt.hash(password, 10);

    // สร้างผู้ใช้ใหม่
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      user_type,
    });

    res
      .status(201)
      .json({ message: "User registered successfully!", user: newUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔑 Login (เข้าสู่ระบบ)
const login = async (req, res) => {
  try {
    console.log("Login request received:", req.body);

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Missing email or password" });
    }

    const user = await User.findOne({ where: { email } });
    console.log("User found:", user); // 🔍 Check if user exists

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password." });
    }

    const token = jwt.sign(
      { userId: user.user_id, email: user.email, userType: user.user_type },
      process.env.JWT_SECRET,
      { expiresIn: "7h" } // Token expires in 7 hours
    );

    // ✅ Log what we are sending back
    const responseData = {
      message: "Login successful!",
      token,
      user: { userType: user.user_type, email: user.email },
    };
    console.log("Login Response:", responseData);

    return res.json(responseData);
  } catch (error) {
    console.error("Login Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

// ✉️ Forgot Password (ลืมรหัสผ่าน)
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found." });

    // สร้าง Token สำหรับ Reset Password
    const resetToken = jwt.sign(
      { userId: user.user_id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // ส่งอีเมลรีเซ็ตรหัสผ่าน
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset Request",
      text: `Click this link to reset your password: http://localhost:3000/reset-password?token=${resetToken}`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "Password reset link sent to your email!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔄 Reset Password (ตั้งรหัสผ่านใหม่)
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // ตรวจสอบ Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ค้นหาผู้ใช้
    const user = await User.findByPk(decoded.userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    // อัปเดตรหัสผ่านใหม่
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password reset successful!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUser = async (req, res) => {
  try {
    // ดึง Token จาก Header
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    // ตรวจสอบ Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ค้นหาผู้ใช้จาก ID ที่ถอดรหัสจาก Token
    const user = await User.findByPk(decoded.userId, {
      attributes: ["user_id", "name", "email", "user_type"],
    });

    if (!user) return res.status(404).json({ message: "User not found." });

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { register, login, forgotPassword, resetPassword, getUser };
