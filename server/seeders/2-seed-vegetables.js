"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const vegetables = [
      "เคล (Kale)",
      "สวิสชาร์ด (Swiss Chard)",
      "มิซูน่า (Mizuna)",
      "กรีนปัตตาเวีย (Green batavia)",
      "กรีนโอ๊ค (Green Oak)",
      "กรีนคอส (Green Cos)",
      "เบบี้คอส (Baby Cos)",
      "บัตเตอร์เฮด (Butterhead)",
      "ฟิลเลย์ไอซ์เบิร์ก (Frillice Iceberg)",
      "ซาลาโนวา (Salanova)",
      "อิตาเลี่ยนเบซิล (Italian Basil)",
      "ร๊อคเก็ต (Rocket)",
      "ไวด์ร๊อคเก็ต (Wild Rocket)"
    ];

    const now = new Date();

    const data = vegetables.map(name => ({
      name,
      description: null,
      stock: 100, // 🔧 Default stock, ปรับได้ตามชอบ
      created_at: now
    }));

    await queryInterface.bulkInsert("Vegetables", data, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("Vegetables", null, {});
  }
};
