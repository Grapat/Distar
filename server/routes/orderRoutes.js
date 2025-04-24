const express = require("express");
const {
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
} = require("../controllers/orderController");
const router = express.Router();

router.post("/place/:user_id", createOrder);


router.get("/all/:id", getOrderById);
router.get("/arrived/user/:user_id", getArrivedOrdersByUserId);
router.get("/success/user/:user_id", getSuccessOrdersByUserId);
router.get("/pending/user/:user_id", getPendingOrdersByUserId);
router.get("/arrived", getArrivedOrders);
router.get("/success", getSuccessOrders);
router.get("/pending", getPendingOrders);
router.get("/", getAllOrders);

router.put("/:id", updateOrderStatus);
router.delete("/:id", deleteOrder);

module.exports = router;
