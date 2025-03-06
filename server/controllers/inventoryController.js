const { Inventory, Vegetable } = require("../models");

// 📊 ดึงรายการเปลี่ยนแปลงสต็อกทั้งหมด
const getAllInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findAll({
      include: [{ model: Vegetable, as: "vegetable" }],
    });
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📊 ดึงข้อมูลสต็อกตาม `id`
const getInventoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const inventory = await Inventory.findByPk(id, {
      include: [{ model: Vegetable, as: "vegetable" }],
    });
    if (!inventory)
      return res.status(404).json({ message: "Inventory record not found" });
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ➕ เพิ่มข้อมูลสต็อกใหม่
const addInventory = async (req, res) => {
  try {
    const { vegetable_id, change, reason } = req.body;

    // เช็คว่าผักที่เกี่ยวข้องมีอยู่จริง
    const vegetable = await Vegetable.findByPk(vegetable_id);
    if (!vegetable)
      return res.status(404).json({ message: "Vegetable not found" });

    // บันทึกข้อมูลการเปลี่ยนแปลงสต็อก
    const newInventory = await Inventory.create({
      vegetable_id,
      change,
      reason,
    });

    // อัปเดตสต็อกของผักในตาราง `Vegetables`
    vegetable.stock += change;
    await vegetable.save();

    res.status(201).json(newInventory);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ❌ ลบข้อมูลสต็อก
const deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const inventory = await Inventory.findByPk(id);
    if (!inventory)
      return res.status(404).json({ message: "Inventory record not found" });

    await inventory.destroy();
    res.json({ message: "Inventory record deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllInventory,
  getInventoryById,
  addInventory,
  deleteInventory,
};
