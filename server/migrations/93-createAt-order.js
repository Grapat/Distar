module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.addColumn("Orders", "createdAt", {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      });
      await queryInterface.addColumn("Orders", "updatedAt", {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      });
    },
    down: async (queryInterface) => {
      await queryInterface.removeColumn("Orders", "createdAt");
      await queryInterface.removeColumn("Orders", "updatedAt");
    },
  };
  