const express = require("express");
const router = express.Router();

// ตัวอย่าง route
router.get("/", (req, res) => {
    res.json({ message: "Vegetables API is working!" });
});

module.exports = router;
