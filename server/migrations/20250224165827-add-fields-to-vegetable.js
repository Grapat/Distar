module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Vegetables", "description", {
      type: Sequelize.TEXT,
      allowNull: true
    });

    await queryInterface.addColumn("Vegetables", "stock", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn("Vegetables", "category_id", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "Categories",
        key: "category_id"
      },
      onDelete: "CASCADE"
    });

    await queryInterface.addColumn("Vegetables", "deletedAt", {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn("Vegetables", "description");
    await queryInterface.removeColumn("Vegetables", "stock");
    await queryInterface.removeColumn("Vegetables", "category_id");
    await queryInterface.removeColumn("Vegetables", "deletedAt");
  }
};
