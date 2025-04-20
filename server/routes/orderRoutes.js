const express = require("express");
const {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  getArrivedOrders,
  getSuccessOrders
} = require("../controllers/orderController");
const router = express.Router();

router.post("/place/:user_id", createOrder);
router.get("/", getAllOrders);
router.get("/orders/arrived", getArrivedOrders);
router.get("/orders/success", getSuccessOrders);
router.get("/:id", getOrderById);
router.put("/:id", updateOrderStatus);
router.delete("/:id", deleteOrder);

module.exports = router;
