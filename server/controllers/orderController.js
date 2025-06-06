const {
  Cart,
  Order,
  Order_Item,
  Vegetable,
  Inventory,
  User,
} = require("../models");

// 📦 สร้างคำสั่งซื้อใหม่โดยใช้ผักจากตะกร้า
const createOrder = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { date_deli, address } = req.body; // ✅ เพิ่ม address

    if (!address || address.trim() === "") {
      return res.status(400).json({ message: "กรุณาระบุที่อยู่จัดส่งค่ะ" });
    }

    const cartItems = await Cart.findAll({ where: { user_id } });
    if (!cartItems || cartItems.length === 0) {
      return res
        .status(400)
        .json({ message: "ตะกร้าว่าง ไม่สามารถสั่งซื้อได้" });
    }

    const user = await User.findByPk(user_id);
    if (!user) return res.status(404).json({ message: "ไม่พบผู้ใช้" });

    const totalQuantity = cartItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    if (totalQuantity > user.credit) {
      return res.status(400).json({
        message: `ยอดรวมสินค้า ${totalQuantity} เกินเครดิตที่มีอยู่ (${user.credit}) ค่ะ`,
      });
    }

    const deliveryDate = new Date(date_deli); // ✅ แปลงวันที่
    const DOW = deliveryDate.toLocaleDateString("en-US", { weekday: "long" }); // ✅ แปลงเป็นชื่อวัน
    const trimmedAddress = address?.trim();

    const newOrder = await Order.create({
      user_id,
      date_deli: deliveryDate,
      DOW,
      address: trimmedAddress, // ✅ เพิ่มที่อยู่จัดส่ง
    });

    // ✅ สร้าง Order_Item และจัดการ Stock
    for (const item of cartItems) {
      await Order_Item.create({
        order_id: newOrder.order_id,
        vegetable_id: item.vegetable_id,
        quantity: item.quantity,
      });

      const vegetable = await Vegetable.findByPk(item.vegetable_id);
      if (vegetable) {
        vegetable.stock -= item.quantity;
        await vegetable.save();

        await Inventory.create({
          vegetable_id: item.vegetable_id,
          change: -item.quantity,
          reason: "sale",
          created_at: new Date(),
        });
      }
    }

    await Cart.destroy({ where: { user_id } });

    res.status(201).json({
      message: "📦 สร้างออเดอร์สำเร็จ!",
      order_id: newOrder.order_id,
      date_deli: deliveryDate,
      DOW,
    });
  } catch (error) {
    console.error("❌ Error creating order:", error);
    res.status(400).json({ error: error.message });
  }
};

// 📋 ดึงคำสั่งซื้อทั้งหมด
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      attributes: [
        "order_id",
        "user_id",
        "status",
        "date_deli",
        "DOW",
        "address",
      ],
      include: [
        { model: User, attributes: ["name", "email"] },
        {
          model: Order_Item,
          as: "Order_Items",
          include: [{ model: Vegetable, attributes: ["name"] }],
        },
      ],
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📋 ดึงคำสั่งซื้อรายตัว
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id, {
      include: [
        { model: User, attributes: ["name", "email"] },
        {
          model: Order_Item,
          as: "Order_Items",
          include: [{ model: Vegetable, attributes: ["name"] }],
        },
      ],
    });

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json({
      order_id: order.order_id,
      user: order.User,
      status: order.status,
      items: order.Order_Items,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔄 อัปเดตสถานะ
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();

    res.json({ message: "อัปเดตสถานะสำเร็จ!", order });
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
    res.json({ message: "ลบคำสั่งซื้อแล้ว" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📋 ดึง order ที่ status = 'arrived'
const getArrivedOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { status: "shipped" },
      attributes: ["order_id", "status", "createdAt"],
      include: [
        {
          model: Order_Item,
          as: "Order_Items",
          include: [{ model: Vegetable, attributes: ["name"] }],
        },
      ],
    });

    res.json(
      orders.map((o) => ({
        id: o.order_id,
        status: o.status,
        date: o.createdAt,
        total: o.Order_Items.reduce((sum, i) => sum + i.quantity, 0),
        items: o.Order_Items,
      }))
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ ดึง order ที่ status = 'shipped' ตาม user_id
const getArrivedOrdersByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;
    const orders = await Order.findAll({
      where: { user_id, status: "shipped" },
      attributes: ["order_id", "status", "createdAt"],
      include: [
        { model: User, attributes: ["name", "email"] },
        {
          model: Order_Item,
          as: "Order_Items",
          include: [{ model: Vegetable, attributes: ["name"] }],
        },
      ],
    });

    res.json(
      orders.map((o) => ({
        id: o.order_id,
        user: o.User,
        status: o.status,
        date: o.createdAt,
        total: o.Order_Items.reduce((sum, i) => sum + i.quantity, 0),
        items: o.Order_Items,
      }))
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📋 ดึง order ที่ status = 'success'
const getSuccessOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { status: "delivered" },
      attributes: ["order_id", "status", "createdAt"],
      include: [
        {
          model: Order_Item,
          as: "Order_Items",
          include: [{ model: Vegetable, attributes: ["name"] }],
        },
      ],
    });

    res.json(
      orders.map((o) => ({
        id: o.order_id,
        status: o.status,
        date: o.createdAt,
        total: o.Order_Items.reduce((sum, i) => sum + i.quantity, 0),
        items: o.Order_Items,
      }))
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ ดึง order ที่ status = 'delivered' ตาม user_id
const getSuccessOrdersByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;
    const orders = await Order.findAll({
      where: { user_id, status: "delivered" },
      attributes: ["order_id", "status", "createdAt"],
      include: [
        { model: User, attributes: ["name", "email"] },
        {
          model: Order_Item,
          as: "Order_Items",
          include: [{ model: Vegetable, attributes: ["name"] }],
        },
      ],
    });

    res.json(
      orders.map((o) => ({
        id: o.order_id,
        user: o.User,
        status: o.status,
        date: o.createdAt,
        total: o.Order_Items.reduce((sum, i) => sum + i.quantity, 0),
        items: o.Order_Items,
      }))
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📋 ดึง order ที่ status = 'pending'
const getPendingOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { status: "pending" },
      attributes: ["order_id", "status", "createdAt"],
      include: [
        {
          model: Order_Item,
          as: "Order_Items",
          include: [{ model: Vegetable, attributes: ["name"] }],
        },
      ],
    });

    res.json(
      orders.map((o) => ({
        id: o.order_id,
        status: o.status,
        date: o.createdAt,
        total: o.Order_Items.reduce((sum, i) => sum + i.quantity, 0),
        items: o.Order_Items,
      }))
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ ดึง order ที่ status = 'pending' ตาม user_id
const getPendingOrdersByUserId = async (req, res) => {
  try {
    console.log("🔍 user_id from params:", req.params.user_id);

    const { user_id } = req.params;
    if (!user_id) return res.status(400).json({ error: "user_id is missing!" });

    const orders = await Order.findAll({
      where: { user_id, status: "pending" },
      attributes: ["order_id", "status", "createdAt"],
      include: [
        { model: User, attributes: ["name", "email"] }, // ✅ เชื่อม User
        {
          model: Order_Item,
          as: "Order_Items",
          include: [{ model: Vegetable, attributes: ["name"] }],
        },
      ],
    });

    res.json(
      orders.map((o) => ({
        id: o.order_id,
        user: o.User,
        status: o.status,
        date: o.createdAt,
        total: o.Order_Items.reduce((sum, i) => sum + i.quantity, 0),
        items: o.Order_Items,
      }))
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📋 ดึงคำสั่งซื้อทั้งหมดตาม DOW
const getOrdersByDOW = async (req, res) => {
  try {
    const { dow } = req.params;

    if (!dow) {
      return res.status(400).json({ message: "ต้องระบุชื่อวัน DOW ด้วยค่ะ" });
    }

    const orders = await Order.findAll({
      where: { DOW: dow },
      attributes: ["order_id", "status", "date_deli", "DOW"],
      include: [
        { model: User, attributes: ["name", "email"] },
        {
          model: Order_Item,
          as: "Order_Items",
          include: [{ model: Vegetable, attributes: ["name"] }],
        },
      ],
    });

    res.json(
      orders.map((o) => ({
        id: o.order_id,
        user: o.User,
        status: o.status,
        date: o.date_deli,
        DOW: o.DOW,
        total: o.Order_Items.reduce((sum, i) => sum + i.quantity, 0),
        items: o.Order_Items,
      }))
    );
  } catch (error) {
    console.error("❌ Error fetching orders by DOW:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  getArrivedOrders,
  getArrivedOrdersByUserId,
  getSuccessOrders,
  getSuccessOrdersByUserId,
  getPendingOrders,
  getPendingOrdersByUserId,
  getOrdersByDOW,
};
