"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      Order.belongsTo(models.User, { foreignKey: "user_id" });
      Order.hasMany(models.Order_Item, { foreignKey: "order_id", as: "Order_Items" });
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
      credits_remaining: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 10 // ✅ แต่ละออเดอร์เริ่มที่ 10 เครดิต
      },
      status: {
        type: DataTypes.ENUM("pending", "shipped", "delivered"),
        allowNull: false,
        defaultValue: "pending"
      }
    },
    {
      sequelize,
      modelName: "Order",
      tableName: "Orders",
      timestamps: true
    }
  );

  return Order;
};
