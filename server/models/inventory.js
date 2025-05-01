"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Inventory extends Model {
    static associate(models) {
      Inventory.belongsTo(models.Vegetable, { foreignKey: "vegetable_id" });
    }
  }

  Inventory.init(
    {
      inventory_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      vegetable_id: DataTypes.INTEGER,
      change: DataTypes.INTEGER,
      reason: DataTypes.ENUM("restock", "sale", "correction"),
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP")
      }
    },
    {
      sequelize,
      modelName: "Inventory",
      tableName: "Inventory",
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false
    }
  );

  return Inventory;
};
