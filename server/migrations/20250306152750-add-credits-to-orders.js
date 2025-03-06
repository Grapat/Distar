"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Orders", "credits_remaining", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 10 // ✅ Default 10 credits per order
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn("Orders", "credits_remaining");
  }
};
