"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Order_Items", {
      order_item_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      order_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Orders",
          key: "order_id"
        },
        onDelete: "CASCADE"
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
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
        allowNull: false
      }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("Order_Items");
  }
};
