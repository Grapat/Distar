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
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      phone: DataTypes.STRING,
      address: DataTypes.TEXT,
      user_type: DataTypes.ENUM("customer", "admin"),
      created_at: DataTypes.DATE
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
