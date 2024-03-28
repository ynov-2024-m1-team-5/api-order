const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const ShoppingCart = sequelize.define("ShoppingCart", {
    shoppingCartId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    customerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'customer',
            key: 'id'
        }
    },
    totalPrice: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        allowNull: false
    }
})

module.exports = ShoppingCart;