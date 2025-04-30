"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Cart", {
      cart_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: "Users",
          key: "user_id"
        },
        onDelete: "CASCADE"
      },
      product_id: {
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
        allowNull: false,
        defaultValue: 1
      }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("Cart");
  }
};
