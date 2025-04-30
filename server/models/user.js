"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Order, { foreignKey: "user_id" });
    }
  }

  User.init(
    {
      user_id: {
        type: DataTypes.STRING,
        primaryKey: true
      },
      name: DataTypes.STRING,
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
      },
      password: DataTypes.STRING,
      phone: DataTypes.STRING,
      address: DataTypes.TEXT,
      alt_address: DataTypes.TEXT, // ✅ ที่อยู่สำรอง
      province: DataTypes.STRING,
      zipcode: DataTypes.STRING,
      user_type: DataTypes.ENUM("customer", "admin"),
      credit: {
        type: DataTypes.INTEGER,
        defaultValue: 10
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP")
      }
    },
    {
      sequelize,
      modelName: "User",
      tableName: "Users",
      timestamps: false
    }
  );

  return User;
};
