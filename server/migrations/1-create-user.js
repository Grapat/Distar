'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Users", {
      user_id: {
        type: Sequelize.STRING,
        primaryKey: true
      },
      name: Sequelize.STRING,
      email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      password: Sequelize.STRING,
      phone: Sequelize.STRING,
      address: Sequelize.TEXT,
      province: Sequelize.STRING,
      zipcode: Sequelize.STRING,
      user_type: {
        type: Sequelize.ENUM("customer", "admin")
      },
      credit: {
        type: Sequelize.INTEGER,
        defaultValue: 10
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW")
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Users");
  }
};
