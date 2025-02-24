"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      // เชื่อมโยงกับ Vegetables
      Category.hasMany(models.Vegetable, {
        foreignKey: "category_id",
        as: "vegetables"
      });
    }
  }

  Category.init(
    {
      category_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: "Category",
      tableName: "Categories",
      timestamps: true
    }
  );

  return Category;
};
