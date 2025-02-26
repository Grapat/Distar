"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      Order.belongsTo(models.User, { foreignKey: "user_id" });
      Order.hasMany(models.Order_Item, { foreignKey: "order_id" });
    }
  }

  Order.init(
    {
      order_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: DataTypes.INTEGER,
      status: DataTypes.ENUM("pending", "shipped", "delivered"),
      created_at: DataTypes.DATE
    },
    {
      sequelize,
      modelName: "Order",
      tableName: "Orders",
      timestamps: false
    }
  );

  return Order;
};
