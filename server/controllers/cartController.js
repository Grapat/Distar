const { Cart, Vegetable, User } = require("../models");

// 🛒 ดึงรายการสินค้าในตะกร้า (ตัด price ออกเพราะไม่ใช้ราคา)
const getCart = async (req, res) => {
  try {
    const { user_id } = req.query;
    const cart = await Cart.findAll({
      where: { user_id },
      include: [{ model: Vegetable, attributes: ["name"] }] // ❌ เอา price ออก
    });
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ➕ เพิ่มสินค้าเข้าตะกร้า (เช็คเครดิตก่อน)
const addToCart = async (req, res) => {
  try {
    const { user_id, product_id, quantity } = req.body;

    // ✅ เช็คว่าสินค้านี้มีอยู่ในตะกร้าอยู่แล้วหรือไม่
    const existingItem = await Cart.findOne({ where: { user_id, product_id } });

    // ✅ ดึงรายการทั้งหมดในตะกร้า
    const cartItems = await Cart.findAll({ where: { user_id } });

    // ✅ คำนวณจำนวนเครดิตที่ใช้ไปแล้ว
    let totalCreditsUsed = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    totalCreditsUsed += quantity; // ✅ บวกกับสินค้าที่กำลังเพิ่ม

    // ❌ ถ้าเครดิตเกิน 10 ให้ปฏิเสธ
    if (totalCreditsUsed > 10) {
      return res.status(400).json({ message: "Not enough credits! Maximum is 10 credits per order." });
    }

    // ✅ ถ้ามีสินค้านี้อยู่แล้ว ให้เพิ่มจำนวนแทน
    if (existingItem) {
      existingItem.quantity += quantity;
      await existingItem.save();
      return res.json(existingItem);
    }

    // ✅ ถ้ายังไม่มีสินค้านี้ ให้เพิ่มเข้าไปใหม่
    const newItem = await Cart.create({ user_id, product_id, quantity });
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ✏️ อัปเดตจำนวนสินค้าในตะกร้า (ต้องเช็คเครดิต)
const updateCart = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const cartItem = await Cart.findByPk(id);
    if (!cartItem) return res.status(404).json({ message: "Cart item not found" });

    // ✅ ดึงรายการทั้งหมดในตะกร้า
    const cartItems = await Cart.findAll({ where: { user_id: cartItem.user_id } });

    // ✅ คำนวณเครดิตที่ใช้ไปทั้งหมด (รวมสินค้าที่อัปเดต)
    let totalCreditsUsed = cartItems.reduce((sum, item) => sum + (item.id === id ? quantity : item.quantity), 0);

    // ❌ ถ้าเครดิตเกิน 10 ให้ปฏิเสธ
    if (totalCreditsUsed > 10) {
      return res.status(400).json({ message: "Not enough credits! Maximum is 10 credits per order." });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    res.json(cartItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ❌ ลบสินค้าออกจากตะกร้า
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

module.exports = { getCart, addToCart, updateCart, removeFromCart };
