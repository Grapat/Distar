'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Vegetables', [
      {
        name: "Kale"
      },
      {
        name: "Swiss chard"
      },
      {
        name: "Mizuna"
      },
      {
        name: "Green batavia"
      },
      {
        name: "Green Oak"
      },
      {
        name: "Green Cos"
      },
      {
        name: "Baby Cos"
      },
    ])
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Vegetables', null, {});
  }
};
