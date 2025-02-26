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
      created_at: DataTypes.DATE
    },
    {
      sequelize,
      modelName: "Inventory",
      tableName: "Inventory",
      timestamps: false
    }
  );

  return Inventory;
};
