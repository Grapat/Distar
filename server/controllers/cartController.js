const { Cart, Vegetable, User } = require("../models");

const getAllCarts = async (req, res) => {
  try {
    const carts = await Cart.findAll({
      attributes: ["id", "quantity"],
      include: [
        { model: Vegetable, attributes: ["name"] },
        { model: User, attributes: ["id", "name", "email"] }
      ]
    });
    res.json(carts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCart = async (req, res) => {
  try {
    const { user_id } = req.query;
    const cart = await Cart.findAll({
      where: { user_id },
      attributes: ["id", "quantity"],
      include: [{ model: Vegetable, attributes: ["name"] }]
    });
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addToCart = async (req, res) => {
  try {
    const { user_id, product_id, quantity } = req.body;
    const existingItem = await Cart.findOne({ where: { user_id, product_id } });
    const cartItems = await Cart.findAll({ where: { user_id } });
    let totalCreditsUsed = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    if (existingItem) {
      totalCreditsUsed += quantity;
      if (totalCreditsUsed > 10) {
        return res.status(400).json({ message: "Not enough credits!" });
      }
      existingItem.quantity += quantity;
      await existingItem.save();
      return res.json(existingItem);
    }

    if (totalCreditsUsed + quantity > 10) {
      return res.status(400).json({ message: "Not enough credits!" });
    }

    const newItem = await Cart.create({ user_id, product_id, quantity });
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateCart = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const cartItem = await Cart.findByPk(id);
    if (!cartItem) return res.status(404).json({ message: "Cart item not found" });
    
    const cartItems = await Cart.findAll({ where: { user_id: cartItem.user_id } });
    let totalCreditsUsed = cartItems.map(item => item.id === id ? quantity : item.quantity).reduce((sum, qty) => sum + qty, 0);

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

const adminCreateCart = async (req, res) => {
  try {
    const { user_id, product_id, quantity } = req.body;
    console.log("Received Data:", { user_id, product_id, quantity }); // ✅ Debug ข้อมูลที่ได้รับ

    const user = await User.findByPk(user_id);
    if (!user) return res.status(404).json({ message: "User not found." });

    console.log("User Found:", user.name); // ✅ Debug User

    const existingItem = await Cart.findOne({ where: { user_id, product_id } });

    console.log("Existing Cart Item:", existingItem); // ✅ Debug ว่ามีสินค้านี้อยู่แล้วหรือไม่

    const cartItems = await Cart.findAll({ where: { user_id } });
    let totalCreditsUsed = cartItems.reduce((sum, item) => sum + item.quantity, 0) + quantity;

    if (totalCreditsUsed > 10) {
      return res.status(400).json({ message: "Not enough credits! Maximum is 10 credits per order." });
    }

    if (existingItem) {
      existingItem.quantity += quantity;
      await existingItem.save();
      return res.json(existingItem);
    }

    const newCart = await Cart.create({ user_id, product_id, quantity });
    res.status(201).json(newCart);
  } catch (error) {
    console.error("Error in adminCreateCart:", error); // ✅ แสดง Error ใน Console
    res.status(500).json({ error: error.message });
  }
};


const removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;
    const cartItem = await Cart.findByPk(id);
    if (!cartItem) return res.status(404).json({ message: "Cart item not found" });

    await cartItem.destroy();
    res.json({ message: "Item removed from cart" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const clearUserCart = async (req, res) => {
  try {
    const { user_id } = req.params;
    await Cart.destroy({ where: { user_id } });
    res.json({ message: "All items removed from user's cart" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getCart, addToCart, updateCart, getAllCarts, adminCreateCart, removeFromCart, clearUserCart };
