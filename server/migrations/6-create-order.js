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
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: "Users",
          key: "user_id" // ✅ ต้องตรงกับ Users.user_id
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
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