const express = require("express");
const { getCart, addToCart, updateCart, removeFromCart } = require("../controllers/cartController");
const router = express.Router();

router.get("/", getCart);
router.post("/", addToCart);
router.put("/:id", updateCart);
router.delete("/:id", removeFromCart);

module.exports = router;
