"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Vegetable extends Model {
    static associate(models) {
      Vegetable.belongsTo(models.Category, { foreignKey: "category_id" });
      Vegetable.hasMany(models.Inventory, { foreignKey: "vegetable_id" });
      Vegetable.hasMany(models.Order_Item, { foreignKey: "vegetable_id" });
    }
  }

  Vegetable.init(
    {
      vegetable_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: DataTypes.STRING,
      description: DataTypes.TEXT,
      stock: DataTypes.INTEGER,
      category_id: DataTypes.INTEGER,
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP")
      }
    },
    {
      sequelize,
      modelName: "Vegetable",
      tableName: "Vegetables",
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false
    }
  );

  return Vegetable;
};
