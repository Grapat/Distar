const express = require("express");
const { getAllInventory, getInventoryById, addInventory, deleteInventory } = require("../controllers/inventoryController");
const router = express.Router();

router.get("/", getAllInventory);
router.get("/:id", getInventoryById);
router.post("/", addInventory);
router.delete("/:id", deleteInventory);

module.exports = router;
