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

// 🛒 ดึงรายการสินค้าในตะกร้าของผู้ใช้
const getUserCart = async (req, res) => {
  try {
    const { user_id } = req.params;
    const cart = await Cart.findAll({
      where: { user_id },
      attributes: ["cart_id", "vegetable_id", "quantity"],
      include: [
        {
          model: Vegetable,
          attributes: ["name", "image_url"], // ✅ เพิ่ม image_url ที่นี่
        },
      ],
    });

    res.json(cart.length > 0 ? cart : []);
  } catch (error) {
    console.error("Error fetching user cart:", error);
    res.status(500).json({ error: error.message });
  }
};

// ➕ เพิ่มสินค้าเข้าตะกร้า พร้อมตรวจสอบ credit
const addToCart = async (req, res) => {
  try {
    const { user_id, vegetable_id, quantity } = req.body;

    if (!user_id || !vegetable_id || !quantity || quantity < 1) {
      return res.status(400).json({ message: "Invalid input" });
    }

    // ✅ ดึงข้อมูล user เพื่อเช็ค credit
    const user = await User.findByPk(user_id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const currentCredit = user.credit;

    // ✅ ดึงตะกร้าปัจจุบันเพื่อคำนวณยอดรวม
    const cartItems = await Cart.findAll({ where: { user_id } });

    // ✅ เช็คว่ามีผักนี้อยู่แล้วไหม
    const existingItem = cartItems.find((item) => item.vegetable_id === vegetable_id);

    let totalQuantity = cartItems.reduce((sum, item) => {
      if (existingItem && item.vegetable_id === vegetable_id) {
        return sum + (item.quantity + quantity); // ถ้าจะเพิ่มบนของเดิม
      }
      return sum + item.quantity;
    }, existingItem ? 0 : quantity); // ถ้ายังไม่มี บวกของใหม่เพิ่มไปเลย

    // ✅ ตรวจสอบว่าเกิน credit หรือไม่
    if (totalQuantity > currentCredit) {
      return res.status(400).json({
        message: `จำนวนรวม ${totalQuantity} เกินเครดิตที่มีอยู่ (${currentCredit})`,
      });
    }

    // ✅ เพิ่มหรืออัปเดต
    if (existingItem) {
      existingItem.quantity += quantity;
      await existingItem.save();
      return res.json(existingItem);
    }

    const newItem = await Cart.create({ user_id, vegetable_id, quantity });
    res.status(201).json(newItem);
  } catch (error) {
    console.error("Error in addToCart:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✏️ อัปเดตจำนวนสินค้าในตะกร้า โดยต้องไม่เกิน credit ของผู้ใช้
const updateCart = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    // ✅ ตรวจสอบข้อมูลนำเข้า
    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "จำนวนไม่ถูกต้องค่ะ" });
    }

    // ✅ ค้นหารายการตะกร้าตาม id
    const cartItem = await Cart.findByPk(id);
    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    const user_id = cartItem.user_id;

    // ✅ ดึงผู้ใช้เพื่อดู credit
    const user = await User.findByPk(user_id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const currentCredit = user.credit;

    // ✅ ดึงรายการตะกร้าทั้งหมดของผู้ใช้
    const cartItems = await Cart.findAll({ where: { user_id } });

    // ✅ คำนวณยอดรวมใหม่หลังเปลี่ยนแปลงรายการนี้
    let totalQuantity = cartItems.reduce((sum, item) => {
      if (item.cart_id === parseInt(id)) {
        return sum + quantity;
      }
      return sum + item.quantity;
    }, 0);

    // ✅ ตรวจสอบว่าเกิน credit หรือไม่
    if (totalQuantity > currentCredit) {
      return res.status(400).json({
        message: `จำนวนรวม ${totalQuantity} เกินเครดิตที่มีอยู่ (${currentCredit})`,
      });
    }

    // ✅ บันทึกการเปลี่ยนแปลง
    cartItem.quantity = quantity;
    await cartItem.save();
    res.json(cartItem);
  } catch (error) {
    console.error("❌ Error in updateCart:", error);
    res.status(400).json({ error: error.message });
  }
};

// 🛒 เพิ่มสินค้าเข้าตะกร้าผ่าน Admin (ต้องไม่เกินเครดิตของผู้ใช้)
const adminCreateCart = async (req, res) => {
  try {
    const { user_id, vegetable_id, quantity } = req.body;

    // ✅ ตรวจสอบ input
    if (!user_id || !vegetable_id || !quantity || quantity < 1) {
      return res.status(400).json({ message: "Invalid input data" });
    }

    // ✅ ดึง user เพื่อตรวจสอบ credit
    const user = await User.findByPk(user_id);
    if (!user) return res.status(404).json({ message: "User not found." });

    const currentCredit = user.credit;

    // ✅ ดึงรายการในตะกร้าของ user
    const cartItems = await Cart.findAll({ where: { user_id } });
    const existingItem = cartItems.find(item => item.vegetable_id === vegetable_id);

    // ✅ คำนวณยอดรวม
    let totalQuantity = cartItems.reduce((sum, item) => {
      if (existingItem && item.vegetable_id === vegetable_id) {
        return sum + (item.quantity + quantity); // กรณีเพิ่มเข้าอันเดิม
      }
      return sum + item.quantity;
    }, existingItem ? 0 : quantity); // ถ้ายังไม่มี บวกเพิ่มในยอดรวมเลย

    // ✅ ตรวจสอบ credit ก่อนบันทึก
    if (totalQuantity > currentCredit) {
      return res.status(400).json({
        message: `Admin เพิ่มเกินเครดิตของผู้ใช้ (${currentCredit} หน่วย)`,
      });
    }

    // ✅ อัปเดตหรือเพิ่มรายการใหม่
    if (existingItem) {
      existingItem.quantity += quantity;
      await existingItem.save();
      return res.json(existingItem);
    }

    const newCart = await Cart.create({ user_id, vegetable_id, quantity });
    res.status(201).json(newCart);
  } catch (error) {
    console.error("❌ Error in adminCreateCart:", error);
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

// 🧮 ดึงสรุปรวมจำนวนสินค้าทั้งหมดในตะกร้าของผู้ใช้
const getCartSummary = async (req, res) => {
  try {
    const { user_id } = req.params;

    const cartItems = await Cart.findAll({ where: { user_id } });
    const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    res.json({ totalQuantity });
  } catch (error) {
    console.error("Error fetching cart summary:", error);
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
  getCartSummary,
};
