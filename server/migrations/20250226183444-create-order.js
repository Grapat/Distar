"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Orders", {
      order_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "customer_id"
        },
        onDelete: "CASCADE"
      },
      status: {
        type: Sequelize.ENUM("pending", "shipped", "delivered"),
        allowNull: false,
        defaultValue: "pending"
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("Orders");
  }
};
