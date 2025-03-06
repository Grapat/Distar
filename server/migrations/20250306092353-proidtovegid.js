'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.renameColumn("Cart", "product_id", "vegetable_id");
    await queryInterface.renameColumn("Order_Items", "product_id", "vegetable_id");
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.renameColumn("Cart", "vegetable_id", "product_id");
    await queryInterface.renameColumn("Order_Items", "vegetable_id", "product_id");
  }
};
