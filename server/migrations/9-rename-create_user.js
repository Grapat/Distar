"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn("Users", "createdAt", "created_at");
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn("Users", "created_at", "createdAt");
  }
};
