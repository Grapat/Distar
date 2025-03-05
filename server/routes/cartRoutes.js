const express = require("express");
const { getCart, addToCart, updateCart, removeFromCart, getAllCarts, adminCreateCart, clearUserCart } = require("../controllers/cartController");
const router = express.Router();

router.get("/", getCart);
router.get("/all", getAllCarts); // ✅ Admin ดูตะกร้าทั้งหมด
router.post("/", addToCart);
router.post("/admin-create", adminCreateCart); // ✅ Admin สร้างตะกร้าให้ผู้ใช้
router.put("/:id", updateCart);
router.delete("/:id", removeFromCart);
router.delete("/clear/:user_id", clearUserCart); // ✅ Admin ลบตะกร้าทั้งหมดของผู้ใช้

module.exports = router;
