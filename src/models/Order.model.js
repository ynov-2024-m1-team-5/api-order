const { DataTypes } = require('sequelize');
const sequelize = require('../database/index');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  shoppingCart_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'shoppingcart',
      key: 'id'
    }
  },
  customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false
  },
  totalPrice: {
    type: DataTypes.DECIMAL
  },
  method:{
    type: DataTypes.STRING
  },
  date:{
    type: DataTypes.DATE
  },
  status: {
    type: DataTypes.STRING
  }
}, {
  timestamps: false
})

module.exports = Order;