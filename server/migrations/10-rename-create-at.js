"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn("Vegetables", "createdAt", "created_at");
    await queryInterface.renameColumn("Inventory", "createdAt", "created_at");
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn("Vegetables", "created_at", "createdAt");
    await queryInterface.renameColumn("Inventory", "created_at", "createdAt");
  }
};
