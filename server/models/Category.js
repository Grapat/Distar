"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      Category.hasMany(models.Vegetable, { foreignKey: "category_id" });
    }
  }

  Category.init(
    {
      category_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: DataTypes.STRING
    },
    {
      sequelize,
      modelName: "Category",
      tableName: "Categories",
      timestamps: false
    }
  );

  return Category;
};
