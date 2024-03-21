const Order = require('../models/Order.model');
const ShoppingCart = require('../models/ShoppingCart.model');
const CartProduct = require('../models/CartProduct.model');

const orderStatus = {
  PAID: 'paid',
  PENDING: 'pending',
  CANCELLED: 'cancelled',
  DELIVERED: 'delivered',
  SHIPPED: 'shipped',
  RETURNED: 'returned',
  REFUNDED: 'refunded'
}

exports.createOrder = async (req, res) => {
  // recupère le panier de l'utilisateur
  const shoppingCart = await ShoppingCart.findOne({ where: { customerId: req.userToken.id } });
  if (!shoppingCart) {
    return res.status(400).json({ success: false, message: "Shopping cart not found" });
  }
  //Si le panier est vide
  if (shoppingCart.totalPrice === 0) {
    return res.status(400).json({ success: false, message: "Shopping cart is empty" });
  }

  // crée une commande
  // crée une commande
  const order = await Order.create({
    shoppingCartId: shoppingCart.id,
    customerId: req.userToken.id,
    totalPrice: shoppingCart.totalPrice,
    // method: req.body.method,
    date: new Date(),
    status: orderStatus.PENDING
  });

  //STRIPE

  // crée un PaymentIntent

  // confirmer un PaymentIntent

  
  // paiement de la commande
  order.status = orderStatus.PAID;
  await order.save();
  // change le statut du panier
  shoppingCart.totalPrice = 0;
  await shoppingCart.save();
  // change le statut des produits dans le panier
  await CartProduct.update({ isOrder: true }, { where: { shoppingCartId: shoppingCart.id } });
  // retourne la commande
  res.send({
    success: true,
    data: order
  })
}

exports.getAllOrders = async (req, res) => {
  // recupère tous les commandes
  const orders = await Order.findAll();
  // retourne les commandes
  res.send({
    success: true,
    data: orders
  })
}