'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedAdminPassword = await bcrypt.hash("admin123", 10);
    const hashedCustomerPassword = await bcrypt.hash("customer123", 10);

    await queryInterface.bulkInsert('Users', [
      {
        user_id: 'SW0000',
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedAdminPassword,
        phone: '0800000000',
        address: '123 Admin Street',
        alt_address: '456 Backup Street',
        province: 'Bangkok',
        zipcode: '10000',
        user_type: 'admin',
        credit: 999,
        created_at: new Date()
      },
      {
        user_id: 'SW9999',
        name: 'Customer User',
        email: 'customer@example.com',
        password: hashedCustomerPassword,
        phone: '0899999999',
        address: '789 Customer Road',
        alt_address: '',
        province: 'Chiang Mai',
        zipcode: '50000',
        user_type: 'customer',
        credit: 10,
        created_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', {
      user_id: ['SW0000', 'SW9999']
    });
  }
};
