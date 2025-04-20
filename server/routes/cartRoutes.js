const express = require("express");
const {
  getCart,
  addToCart,
  updateCart,
  removeFromCart,
  getAllCarts,
  adminCreateCart,
  clearUserCart,
  getUserCart,
  getCartSummary,
} = require("../controllers/cartController");
const router = express.Router();

router.get("/", getCart);
router.get("/all", getAllCarts); // ✅ Admin ดูตะกร้าทั้งหมด
router.get("/summary/:user_id", getCartSummary); // ✅ Admin ดูจำนวนสินค้าทั้งหมดในตะกร้าของผู้ใช้
router.get("/user/:user_id", getUserCart);
router.post("/", addToCart);
router.post("/admin-create", adminCreateCart); // ✅ Admin สร้างตะกร้าให้ผู้ใช้
router.put("/:id", updateCart);
router.delete("/:id", removeFromCart);
router.delete("/clear/:user_id", clearUserCart); // ✅ Admin ลบตะกร้าทั้งหมดของผู้ใช้

module.exports = router;
