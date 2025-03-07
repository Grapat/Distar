"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn("Users", "customer_id", "user_id");
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn("Users", "user_id", "customer_id");
  },
};
