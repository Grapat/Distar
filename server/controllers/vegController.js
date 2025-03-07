const { Vegetable } = require("../models");

// 🥦 ดึงรายการผักทั้งหมด
const getAllVegetables = async (req, res) => {
  try {
    const vegetables = await Vegetable.findAll({
      include: [{ model: Category, attributes: ["name"] }], // Include category name
    });

    res.json(vegetables);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🥬 ดึงข้อมูลผักตาม `id`
const getVegetableById = async (req, res) => {
  try {
    const { id } = req.params;
    const vegetable = await Vegetable.findByPk(id);
    if (!vegetable) return res.status(404).json({ message: "Vegetable not found" });
    res.json(vegetable);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🌱 เพิ่มผักใหม่
const createVegetable = async (req, res) => {
  try {
    const { name, description, stock, category_id } = req.body;
    const newVegetable = await Vegetable.create({ name, description, stock, category_id });
    res.status(201).json(newVegetable);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ✏️ อัปเดตข้อมูลผัก
const updateVegetable = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, stock, category_id } = req.body;

    const vegetable = await Vegetable.findByPk(id);
    if (!vegetable) return res.status(404).json({ message: "Vegetable not found" });

    await vegetable.update({ name, description, stock, category_id });
    res.json(vegetable);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ❌ ลบผักออกจากระบบ
const deleteVegetable = async (req, res) => {
  try {
    const { id } = req.params;
    const vegetable = await Vegetable.findByPk(id);
    if (!vegetable) return res.status(404).json({ message: "Vegetable not found" });

    await vegetable.destroy();
    res.json({ message: "Vegetable deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllVegetables, getVegetableById, createVegetable, updateVegetable, deleteVegetable };
