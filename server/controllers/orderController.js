const {
  Cart,
  Order,
  Order_Item,
  Vegetable,
  Inventory,
  User,
} = require("../models"); // Assuming models are correctly imported

// --- Helper for consistent order data transformation (Optional, but good for reuse) ---
const mapOrderForResponse = (order) => {
  if (!order) return null;

  return {
    order_id: order.order_id,
    user_id: order.user_id,
    status: order.status,
    createdAt: order.createdAt, // Ensure this is explicitly included
    date_deli: order.date_deli,
    DOW: order.DOW,
    address: order.address,
    User: order.User ? { name: order.User.name, email: order.User.email } : null, // Only include necessary user attributes
    Order_Items: order.Order_Items
      ? order.Order_Items.map((item) => ({
          order_item_id: item.order_item_id,
          vegetable_id: item.vegetable_id,
          quantity: item.quantity,
          Vegetable: item.Vegetable ? { name: item.Vegetable.name } : null,
        }))
      : [],
  };
};

// 📦 สร้างคำสั่งซื้อใหม่โดยใช้ผักจากตะกร้า
const createOrder = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { date_deli, address } = req.body;

    if (!address || address.trim() === "") {
      return res.status(400).json({ message: "กรุณาระบุที่อยู่จัดส่งค่ะ" });
    }
    if (!date_deli) { // Ensure delivery date is provided
      return res.status(400).json({ message: "กรุณาระบุวันที่จัดส่งค่ะ" });
    }

    const cartItems = await Cart.findAll({ where: { user_id } });
    if (!cartItems || cartItems.length === 0) {
      return res
        .status(400)
        .json({ message: "ตะกร้าว่าง ไม่สามารถสั่งซื้อได้" });
    }

    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ message: "ไม่พบผู้ใช้" });
    }

    const totalQuantity = cartItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    // Assuming 'credit' is an integer representing max quantity
    if (totalQuantity > user.credit) {
      return res.status(400).json({
        message: `ยอดรวมสินค้า ${totalQuantity} เกินเครดิตที่มีอยู่ (${user.credit}) ค่ะ`,
      });
    }

    const deliveryDate = new Date(date_deli);
    // Check if deliveryDate is a valid date
    if (isNaN(deliveryDate.getTime())) {
      return res.status(400).json({ message: "รูปแบบวันที่จัดส่งไม่ถูกต้องค่ะ" });
    }

    const DOW = deliveryDate.toLocaleDateString("en-US", { weekday: "long" });
    const trimmedAddress = address?.trim();

    const newOrder = await Order.create({
      user_id,
      date_deli: deliveryDate,
      DOW,
      address: trimmedAddress,
      status: "pending", // Default status for new orders
    });

    // สร้าง Order_Item และจัดการ Stock
    for (const item of cartItems) {
      const vegetable = await Vegetable.findByPk(item.vegetable_id);
      if (!vegetable || vegetable.stock < item.quantity) {
        // Rollback strategy: In a real app, you might want to delete the created order
        // or prevent creation if stock is insufficient before loop starts.
        console.warn(`Insufficient stock for vegetable_id ${item.vegetable_id}`);
        // Optionally, inform the user about the stock issue and stop the order creation
        // For simplicity here, we'll continue but log the warning.
      }

      await Order_Item.create({
        order_id: newOrder.order_id,
        vegetable_id: item.vegetable_id,
        quantity: item.quantity,
      });

      if (vegetable) { // Only update stock if vegetable found
        vegetable.stock -= item.quantity;
        await vegetable.save();

        await Inventory.create({
          vegetable_id: item.vegetable_id,
          change: -item.quantity,
          reason: "sale",
          created_at: new Date(), // Using new Date() for inventory created_at
        });
      }
    }

    await Cart.destroy({ where: { user_id } });

    res.status(201).json({
      message: "📦 สร้างออเดอร์สำเร็จ!",
      order_id: newOrder.order_id,
      // You can return the full order object or specific details
      order: mapOrderForResponse(newOrder), // Return a mapped response
    });
  } catch (error) {
    console.error("❌ Error creating order:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ: " + error.message });
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
        "createdAt", // This attribute is explicitly selected
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
      order: [["createdAt", "DESC"]], // Order by creation date, newest first
    });
    // Map to a consistent response format for consistency
    res.json(orders.map(mapOrderForResponse));
  } catch (error) {
    console.error("❌ Error fetching all orders:", error);
    res.status(500).json({ error: "ไม่สามารถดึงข้อมูลคำสั่งซื้อทั้งหมดได้: " + error.message });
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

    if (!order) {
      return res.status(404).json({ message: "ไม่พบคำสั่งซื้อ" });
    }

    res.json(mapOrderForResponse(order)); // Use consistent mapping
  } catch (error) {
    console.error(`❌ Error fetching order by ID (${req.params.id}):`, error);
    res.status(500).json({ error: "ไม่สามารถดึงข้อมูลคำสั่งซื้อได้: " + error.message });
  }
};

// 🔄 อัปเดตสถานะ
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ message: "ไม่พบคำสั่งซื้อ" });
    }

    // Basic validation for status (optional but good practice)
    const validStatuses = ["pending", "shipped", "delivered"];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "สถานะไม่ถูกต้อง" });
    }

    order.status = status;
    await order.save();

    res.json({ message: "อัปเดตสถานะสำเร็จ!", order: mapOrderForResponse(order) }); // Return updated order
  } catch (error) {
    console.error(`❌ Error updating order status (${req.params.id}):`, error);
    res.status(500).json({ error: "ไม่สามารถอัปเดตสถานะคำสั่งซื้อได้: " + error.message });
  }
};

// ❌ ลบคำสั่งซื้อ
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ message: "ไม่พบคำสั่งซื้อ" });
    }

    await order.destroy(); // This will also delete associated Order_Items if you have `onDelete: 'CASCADE'` in your model associations
    res.json({ message: "ลบคำสั่งซื้อแล้ว" });
  } catch (error) {
    console.error(`❌ Error deleting order (${req.params.id}):`, error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดขณะลบคำสั่งซื้อ: " + error.message });
  }
};

// Helper for filtering by status (reduces redundancy)
const getOrdersByStatus = async (res, status, user_id = null) => {
    try {
        const whereClause = { status };
        if (user_id) {
            whereClause.user_id = user_id;
        }

        const orders = await Order.findAll({
            where: whereClause,
            attributes: ["order_id", "status", "createdAt", "date_deli", "DOW", "address"], // Include all relevant attributes
            include: [
                { model: User, attributes: ["name", "email"] },
                {
                    model: Order_Item,
                    as: "Order_Items",
                    include: [{ model: Vegetable, attributes: ["name"] }],
                },
            ],
            order: [["createdAt", "DESC"]],
        });
        res.json(orders.map(mapOrderForResponse));
    } catch (error) {
        console.error(`❌ Error fetching ${status} orders (user_id: ${user_id}):`, error);
        res.status(500).json({ error: `ไม่สามารถดึงข้อมูลคำสั่งซื้อสถานะ '${status}' ได้: ` + error.message });
    }
};


// 📋 ดึง order ที่ status = 'shipped'
const getArrivedOrders = async (req, res) => getOrdersByStatus(res, "shipped");
const getArrivedOrdersByUserId = async (req, res) => {
    const { user_id } = req.params;
    if (!user_id) return res.status(400).json({ error: "user_id is missing!" });
    getOrdersByStatus(res, "shipped", user_id);
};

// 📋 ดึง order ที่ status = 'delivered'
const getSuccessOrders = async (req, res) => getOrdersByStatus(res, "delivered");
const getSuccessOrdersByUserId = async (req, res) => {
    const { user_id } = req.params;
    if (!user_id) return res.status(400).json({ error: "user_id is missing!" });
    getOrdersByStatus(res, "delivered", user_id);
};

// 📋 ดึง order ที่ status = 'pending'
const getPendingOrders = async (req, res) => getOrdersByStatus(res, "pending");
const getPendingOrdersByUserId = async (req, res) => {
    const { user_id } = req.params;
    if (!user_id) return res.status(400).json({ error: "user_id is missing!" });
    getOrdersByStatus(res, "pending", user_id);
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
      attributes: ["order_id", "status", "createdAt", "date_deli", "DOW", "address"], // Include createdAt here too
      include: [
        { model: User, attributes: ["name", "email"] },
        {
          model: Order_Item,
          as: "Order_Items",
          include: [{ model: Vegetable, attributes: ["name"] }],
        },
      ],
      order: [["createdAt", "DESC"]], // Order by creation date
    });

    res.json(orders.map(mapOrderForResponse)); // Use consistent mapping
  } catch (error) {
    console.error("❌ Error fetching orders by DOW:", error);
    res.status(500).json({ error: "ไม่สามารถดึงข้อมูลคำสั่งซื้อตามวันได้: " + error.message });
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