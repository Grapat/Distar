"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      // เชื่อมกับ User
      Order.belongsTo(models.User, { foreignKey: "user_id" });
      // เชื่อมกับ Order_Item
      Order.hasMany(models.Order_Item, {
        foreignKey: "order_id",
        as: "Order_Items",
      });
    }
  }

  Order.init(
    {
      order_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("pending", "shipped", "delivered"),
        allowNull: false,
        defaultValue: "pending",
      },
      date_deli: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      DOW: {
        type: DataTypes.ENUM(
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday"
        ),
        allowNull: true,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Order",
      tableName: "Orders",
      timestamps: true,
    }
  );

  return Order;
};
