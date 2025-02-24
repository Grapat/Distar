'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Vegetable extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // เชื่อมโยงกับ Categories (1 หมวดหมู่มีหลายผัก)
      Vegetable.belongsTo(models.Category, {
        foreignKey: "category_id",
        as: "category"
      });

      // เชื่อมโยงกับ Inventory (1 ผักมีหลายรายการเปลี่ยนแปลงสต็อก)
      Vegetable.hasMany(models.Inventory, {
        foreignKey: "vegetable_id",
        as: "inventory"
      });

      // เชื่อมโยงกับ OrderItems (1 ผักอยู่ในหลายออเดอร์)
      Vegetable.hasMany(models.Order_items, {
        foreignKey: "product_id",
        as: "order_items"
      });
    }
  }

  Vegetable.init(
    {
      vegetable_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Categories",
          key: "category_id"
        },
        onDelete: "CASCADE"
      }
    },
    {
      sequelize,
      modelName: "Vegetable",
      tableName: "Vegetables",
      timestamps: true,  // เปิดใช้งาน createdAt และ updatedAt
      paranoid: true     // ใช้ soft delete (เพิ่ม deletedAt)
    }
  );

  return Vegetable;
};
