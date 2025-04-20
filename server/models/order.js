"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      // เชื่อมกับ User
      Order.belongsTo(models.User, { foreignKey: "user_id" });
      // เชื่อมกับ Order_Item
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
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      credits_remaining: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 10
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
      timestamps: false, // ถ้าต้องการ createdAt ก็เปลี่ยนเป็น true ได้
    }
  );

  return Order;
};
