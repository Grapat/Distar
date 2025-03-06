"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Order_Item extends Model {
    static associate(models) {
      Order_Item.belongsTo(models.Order, { foreignKey: "order_id" });
      Order_Item.belongsTo(models.Vegetable, { foreignKey: "vegetable_id" });
    }
  }

  Order_Item.init(
    {
      order_item_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      order_id: DataTypes.INTEGER,
      vegetable_id: DataTypes.INTEGER,
      quantity: DataTypes.INTEGER
    },
    {
      sequelize,
      modelName: "Order_Item",
      tableName: "Order_Items",
      timestamps: false
    }
  );

  return Order_Item;
};
