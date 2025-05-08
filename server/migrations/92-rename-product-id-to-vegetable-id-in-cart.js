"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. ลบ foreign key เดิมที่ชื่อ product_id
    await queryInterface.removeConstraint("Cart", "Cart_product_id_fkey");

    // 2. เปลี่ยนชื่อ column จาก product_id → vegetable_id
    await queryInterface.renameColumn("Cart", "product_id", "vegetable_id");

    // 3. เพิ่ม foreign key ใหม่ให้ vegetable_id
    await queryInterface.addConstraint("Cart", {
      fields: ["vegetable_id"],
      type: "foreign key",
      name: "Cart_vegetable_id_fkey",
      references: {
        table: "Vegetables",
        field: "vegetable_id"
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE"
    });
  },

  down: async (queryInterface, Sequelize) => {
    // 1. ลบ foreign key ที่ vegetable_id
    await queryInterface.removeConstraint("Cart", "Cart_vegetable_id_fkey");

    // 2. เปลี่ยนชื่อ column กลับ
    await queryInterface.renameColumn("Cart", "vegetable_id", "product_id");

    // 3. เพิ่ม foreign key กลับไปที่ product_id
    await queryInterface.addConstraint("Cart", {
      fields: ["product_id"],
      type: "foreign key",
      name: "Cart_product_id_fkey",
      references: {
        table: "Vegetables",
        field: "vegetable_id"
      },
      onUpdate: "NO ACTION",
      onDelete: "CASCADE"
    });
  }
};
