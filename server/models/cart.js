"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Cart extends Model {
    static associate(models) {
      Cart.belongsTo(models.User, { foreignKey: "user_id" });
      Cart.belongsTo(models.Vegetable, { foreignKey: "vegetable_id" });
    }
  }

  Cart.init(
    {
      cart_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: DataTypes.INTEGER,
      vegetable_id: DataTypes.INTEGER,
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      }
    },
    {
      sequelize,
      modelName: "Cart",
      tableName: "Cart",
      timestamps: false
    }
  );

  return Cart;
};
