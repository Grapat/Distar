const express = require("express");
const {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  getArrivedOrders,
  getSuccessOrders,
  getPendingOrders
} = require("../controllers/orderController");
const router = express.Router();

router.post("/place/:user_id", createOrder);
router.get("/", getAllOrders);
router.get("/arrived", getArrivedOrders);
router.get("/success", getSuccessOrders);
router.get("/pending", getPendingOrders);
router.get("/:id", getOrderById);
router.put("/:id", updateOrderStatus);
router.delete("/:id", deleteOrder);

module.exports = router;
