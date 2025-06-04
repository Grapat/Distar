"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // ➕ เพิ่มคอลัมน์ date_deli
    await queryInterface.addColumn("Orders", "date_deli", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    // ➕ เพิ่มคอลัมน์ DOW
    await queryInterface.addColumn("Orders", "DOW", {
      type: Sequelize.ENUM(
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ),
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // 🔄 ลบคอลัมน์ DOW
    await queryInterface.removeColumn("Orders", "DOW");

    // 🔄 ลบคอลัมน์ date_deli
    await queryInterface.removeColumn("Orders", "date_deli");
  },
};
