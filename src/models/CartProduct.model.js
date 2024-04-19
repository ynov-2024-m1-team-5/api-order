const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const CartProduct = sequelize.define("CartProduct", {
    cartProductId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Products',
            key: 'id'
        }
    },
    quantitySelected: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    sellingPrice: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0
    },
    isOrder: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    shoppingCartId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'ShoppingCarts',
            key: 'shoppingCartId'
        }
    }
})

module.exports = CartProduct;