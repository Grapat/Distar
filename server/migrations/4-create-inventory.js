"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Inventory", {
      inventory_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      vegetable_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Vegetables",
          key: "vegetable_id"
        },
        onDelete: "CASCADE"
      },
      change: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      reason: {
        type: Sequelize.ENUM("restock", "sale", "correction"),
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("Inventory");
  }
};
