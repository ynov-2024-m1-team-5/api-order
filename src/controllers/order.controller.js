const {Stripe} = require('stripe')
const Order = require('../models/Order.model');
const ShoppingCart = require('../models/ShoppingCart.model');
const CartProduct = require('../models/CartProduct.model');
const sendMail = require('../middlewares/sendMail');
const sequelize = require('../database');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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
  const order = await Order.create({
    shoppingCartId: shoppingCart.id,
    customerId: req.userToken.id,
    totalPrice: shoppingCart.totalPrice,
    date: new Date(),
    status: orderStatus.PENDING
  });

  // STRIPE INTEGRATION

  // crée un PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: shoppingCart.totalPrice * 100,
    currency: 'eur',
  })

  order.stripe_pi = paymentIntent.id;
  await order.save();
  // change le statut du panier
  shoppingCart.totalPrice = 0;
  await shoppingCart.save();
  
  // retourne le client_secret du PaymentIntent
  res.send({
    success: true,
    data: paymentIntent.client_secret
  })
}

exports.confirmOrder = async (req, res) => {
  // recupère la commande
  const order = await Order.findOne({ where: { id: req.params.order_id } });
  if (!order) {
    return res.status(400).json({ success: false, message: "Order not found" });
  }
  // confirmer un PaymentIntent
  const paymentIntent = await stripe.paymentIntents.confirm(order.stripe_pi,{
    payment_method: req.body.payment_method,
    payment_method_data: {
      billing_details: {
        name: req.body.name
      },
      card: {
        number: req.body.number,
        exp_month: req.body.exp_month,
        exp_year: req.body.exp_year,
        cvc: req.body.cvc
      }
    },
    shipping: req.body.shipping
  });

  if (paymentIntent.status !== 'succeeded') {
    return res.status(400).json({ success: false, message: "Payment failed" });
  }
  // change le statut de la commande
  order.status = orderStatus.PAID;
  await order.save();
  // change le statut des produits dans le panier
  await CartProduct.update({ isOrder: true }, { where: { shoppingCartId: order.shoppingCartId } });

  //envoie un email de confirmation
  const results = await sequelize.query(`SELECT * from customer WHERE id=${order.customerId}`, { type: sequelize.QueryTypes.SELECT }); 
  const user = results[0];
  sendMail(user.email, `${user.fist_name} ${user.fist_name}`, 'Order Confirmation', `Your order has been confirmed.`, 'Ecommerce App');
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