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
      credits_remaining: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 10
      },
      status: {
        type: Sequelize.ENUM("pending", "shipped", "delivered"),
        allowNull: false,
        defaultValue: "pending"
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("Orders");
  }
};
