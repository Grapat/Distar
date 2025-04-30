const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const nodemailer = require("nodemailer");
require("dotenv").config();

// 🆔 สร้างรหัสสมาชิกแบบ SW0001
const generateUserId = async () => {
  const lastUser = await User.findOne({
    order: [["created_at", "DESC"]],
  });
  let lastNumber = 0;
  if (lastUser && lastUser.user_id) {
    lastNumber = parseInt(lastUser.user_id.replace("SW", "")) || 0;
  }
  return `SW${(lastNumber + 1).toString().padStart(4, "0")}`;
};

// 📝 Register (ลงทะเบียน)
const register = async (req, res) => {
  try {
    const {
      name, email, password, phone,
      address, alt_address, province, zipcode, user_type
    } = req.body;

    console.log("📥 Register request received with data:", {
      name, email, phone, address, alt_address, province, zipcode, user_type
    });

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.warn("⚠️ Email already exists:", email);
      return res.status(400).json({ message: "Email already in use." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("🔐 Password hashed successfully");

    const user_id = await generateUserId();
    console.log("🆔 Generated user_id:", user_id);

    const newUser = await User.create({
      user_id,
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      alt_address,
      province,
      zipcode,
      user_type,
      credit: 10
    });

    console.log("✅ User created:", newUser.toJSON());

    res.status(201).json({ message: "User registered successfully!", user: newUser });
  } catch (error) {
    console.error("❌ Register Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// 🔑 Login (เข้าสู่ระบบ)
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Missing email or password" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password." });
    }

    const token = jwt.sign(
      {
        user_id: user.user_id,
        email: user.email,
        userType: user.user_type
      },
      process.env.JWT_SECRET,
      { expiresIn: "7h" }
    );

    const responseData = {
      message: "Login successful!",
      token,
      user: {
        userType: user.user_type,
        email: user.email,
        user_id: user.user_id,
      },
    };

    return res.json(responseData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ✉️ Forgot Password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found." });

    const resetToken = jwt.sign(
      { userId: user.user_id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

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

// 🔄 Reset Password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password reset successful!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 👤 Get User
const getUser = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.user_id, {
      attributes: ["user_id", "name", "email", "user_type"],
    });

    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { register, login, forgotPassword, resetPassword, getUser };