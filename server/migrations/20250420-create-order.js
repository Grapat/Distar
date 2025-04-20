"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Orders", {
      order_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users", // ✅ ชื่อตารางต้องตรง
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      credits_remaining: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 10
      },
      status: {
        type: Sequelize.ENUM("pending", "shipped", "delivered"),
        allowNull: false,
        defaultValue: "pending"
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Orders");
  }
};
