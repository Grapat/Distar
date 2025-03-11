const { Cart, Vegetable, User } = require("../models");

// 🛒 ดึงรายการสินค้าในตะกร้าทั้งหมด
const getAllCarts = async (req, res) => {
  try {
    const carts = await Cart.findAll({
      attributes: ["cart_id", "quantity"],
      include: [
        { model: Vegetable, attributes: ["name"] },
        { model: User, attributes: ["user_id", "name", "email"] }, // ✅ แก้ `user` เป็น `User`
      ],
    });
    res.json(carts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🛒 ดึงรายการสินค้าในตะกร้าของผู้ใช้
const getCart = async (req, res) => {
  try {
    const { user_id } = req.query;
    const cart = await Cart.findAll({
      where: { user_id },
      attributes: ["cart_id", "quantity"],
      include: [{ model: Vegetable, attributes: ["name"] }],
    });
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserCart = async (req, res) => {
  try {
    const { user_id } = req.params;
    const cart = await Cart.findAll({
      where: { user_id },
      attributes: ["cart_id", "vegetable_id", "quantity"],
      include: [{ model: Vegetable, attributes: ["name"] }],
    });

    res.json(cart.length > 0 ? cart : []);
  } catch (error) {
    console.error("Error fetching user cart:", error);
    res.status(500).json({ error: error.message });
  }
};

// ➕ เพิ่มสินค้าเข้าตะกร้า
const addToCart = async (req, res) => {
  try {
    const { user_id, vegetable_id, quantity } = req.body;

    // ✅ Check if this vegetable is already in the user's cart
    const existingItem = await Cart.findOne({
      where: { user_id, vegetable_id },
    });

    if (existingItem) {
      existingItem.quantity += quantity; // ✅ Increase quantity if exists
      await existingItem.save();
      return res.json(existingItem);
    }

    // ✅ If the vegetable is NOT in the cart, create a new entry
    const newItem = await Cart.create({ user_id, vegetable_id, quantity });
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ✏️ อัปเดตจำนวนสินค้าในตะกร้า
const updateCart = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const cartItem = await Cart.findByPk(id);
    if (!cartItem)
      return res.status(404).json({ message: "Cart item not found" });

    const cartItems = await Cart.findAll({
      where: { user_id: cartItem.user_id },
    });

    let totalCreditsUsed = cartItems.reduce(
      (sum, item) => sum + (item.cart_id === id ? quantity : item.quantity),
      0
    );

    if (totalCreditsUsed > 10) {
      return res.status(400).json({ message: "Not enough credits!" });
    }

    cartItem.quantity = quantity;
    await cartItem.save();
    res.json(cartItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 🛒 เพิ่มสินค้าเข้าตะกร้าผ่าน Admin
const adminCreateCart = async (req, res) => {
  try {
    const { user_id, vegetable_id, quantity } = req.body;

    // ✅ Validate input
    if (!user_id || !vegetable_id || !quantity || quantity < 1) {
      return res.status(400).json({ message: "Invalid input data" });
    }

    const user = await User.findByPk(user_id);
    if (!user) return res.status(404).json({ message: "User not found." });

    const existingItem = await Cart.findOne({ where: { user_id, vegetable_id } });

    const cartItems = await Cart.findAll({ where: { user_id } });
    let totalCreditsUsed = cartItems.reduce((sum, item) => sum + item.quantity, 0) + quantity;

    if (totalCreditsUsed > 10) {
      return res.status(400).json({ message: "Not enough credits! Maximum is 10 per order." });
    }
    
    if (existingItem) {
      existingItem.quantity += quantity;
      await existingItem.save();
      return res.json(existingItem);
    }

    const newCart = await Cart.create({ user_id, vegetable_id, quantity});
    res.status(201).json(newCart);
  } catch (error) {
    console.error("Error in adminCreateCart:", error);
    res.status(500).json({ error: error.message });
  }
};

// ❌ ลบสินค้าออกจากตะกร้า
const removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;
    const cartItem = await Cart.findByPk(id);
    if (!cartItem)
      return res.status(404).json({ message: "Cart item not found" });

    await cartItem.destroy();
    res.json({ message: "Item removed from cart" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ❌ ล้างตะกร้าของผู้ใช้
const clearUserCart = async (req, res) => {
  try {
    const { user_id } = req.params;
    await Cart.destroy({ where: { user_id } });
    res.json({ message: "All items removed from user's cart" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCart,
  getAllCarts,
  adminCreateCart,
  removeFromCart,
  clearUserCart,
  getUserCart,
};
