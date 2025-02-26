const express = require("express");
const { getAllVegetables, getVegetableById, createVegetable, updateVegetable, deleteVegetable } = require("../controllers/vegController");
const router = express.Router();

router.get("/", getAllVegetables);
router.get("/:id", getVegetableById);
router.post("/", createVegetable);
router.put("/:id", updateVegetable);
router.delete("/:id", deleteVegetable);

module.exports = router;
