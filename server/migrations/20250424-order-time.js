'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Orders', 'createdAt', {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.fn('NOW'), // ให้บันทึกเวลาขณะสร้างอัตโนมัติ
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Orders', 'createdAt');
  }
};
