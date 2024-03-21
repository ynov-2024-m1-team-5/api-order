const { DataTypes } = require('sequelize');
const sequelize = require('../database/index');

const CartProduct = sequelize.define('CartProduct', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  cart_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'shoppingcart',
      key: 'id'
    }
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Products',
      key: 'id'
    }
  },
  selling_price: {
    type: DataTypes.DECIMAL

  },
  quantity: {
    type: DataTypes.INTEGER
  }
}, {
  timestamps: false
});

module.exports = CartProduct;