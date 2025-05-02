const { User } = require("../models");

// 📋 Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll(); // ✅ ไม่จำกัด attributes เลย
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 👤 Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id); // ✅ ให้ส่งทุกฟิลด์
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ➕ Create a new user
const createUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const newUser = await User.create({ name, email, user_type: role });    
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ✏️ Update user information
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      address,
      alt_address,
      province,
      zipcode,
      credit,
      role,
    } = req.body;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.update({
      name,
      email,
      phone,
      address,
      alt_address,
      province,
      zipcode,
      credit,
      user_type: role, // 👈 mapping ให้ตรงกับ model
    });

    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ❌ Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    await user.destroy();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
