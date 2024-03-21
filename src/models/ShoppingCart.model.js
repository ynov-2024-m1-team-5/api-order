const { DataTypes } = require('sequelize');
const sequelize = require('../database/index');

const ShoppingCart = sequelize.define('ShoppingCart', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false
  },
  cart_product_ids: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    references: {
        model: "CartProduct",
        key: "id"
    }
  },
  total_price:{
    type: DataTypes.INTEGER,
    allowNull: false
  },

}, {
  timestamps: false
})

module.exports = ShoppingCart;