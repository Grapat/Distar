const { Order, Order_Item, Vegetable, User } = require("../models");
const { Op } = require("sequelize");

// 📦 สร้างคำสั่งซื้อใหม่โดยใช้เครดิต
const createOrder = async (req, res) => {
    try {
      const { user_id, items } = req.body;
  
      let totalCreditsUsed = 0;
      const orderItems = [];
  
      for (const item of items) {
        totalCreditsUsed += item.quantity; // ✅ 1 ชิ้นใช้ 1 เครดิต
      }
  
      // ❌ เช็คว่าเครดิตเพียงพอหรือไม่
      if (totalCreditsUsed > 10) {
        return res.status(400).json({ message: "Not enough credits! Each order has 10 credits." });
      }
  
      // ✅ สร้างคำสั่งซื้อพร้อมเครดิตที่เหลืออยู่
      const newOrder = await Order.create({ user_id, credits_remaining: 10 - totalCreditsUsed });
  
      // ✅ บันทึกสินค้าในคำสั่งซื้อ
      for (const item of items) {
        await Order_Item.create({
          order_id: newOrder.order_id,
          product_id: item.product_id,
          quantity: item.quantity
        });
      }
  
      res.status(201).json({ message: "Order created successfully!", order: newOrder });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

// 📋 ดึงคำสั่งซื้อทั้งหมด
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: User, attributes: ["name", "email"] },
        { model: Order_Item, include: [{ model: Vegetable, attributes: ["name"] }] }
      ]
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📦 ดึงคำสั่งซื้อโดย `id`
const getOrderById = async (req, res) => {
    try {
      const { id } = req.params;
      const order = await Order.findByPk(id, {
        include: [
          { model: User, attributes: ["name", "email"] },
          { model: Order_Item, include: [{ model: Vegetable, attributes: ["name"] }] }
        ]
      });
      if (!order) return res.status(404).json({ message: "Order not found" });
  
      res.json({
        order_id: order.order_id,
        user: order.User,
        status: order.status,
        credits_remaining: order.credits_remaining, // ✅ แสดงเครดิตที่เหลือ
        items: order.Order_Items
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };  

// 🔄 อัปเดตสถานะคำสั่งซื้อ
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();

    res.json({ message: "Order status updated!", order });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ❌ ลบคำสั่งซื้อ
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    await order.destroy();
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createOrder, getAllOrders, getOrderById, updateOrderStatus, deleteOrder };
