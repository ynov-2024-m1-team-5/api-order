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
  try {
  // recupère le panier de l'utilisateur
  const shoppingCart = await ShoppingCart.findOne({
    where: {
        customerId: req.userToken.customer_id
    }
});
  console.log({shoppingCart});
  if (!shoppingCart) {
    throw new Error("Shopping cart not found");
  }
  //Si le panier est vide
 const countItems= CartProduct.count({ where: { shoppingCartId: shoppingCart.shoppingCartId, isOrder:false} });
 console.log({countItems});
  if (!countItems) {
    throw new Error("Shopping cart is empty");
  }

  // crée une commande
  const order = await Order.create({
    shoppingCart_id: shoppingCart.shoppingCartId,
    customer_id: req.userToken.customer_id,
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
console.log({order});


  //Paiement
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: '{{ONE_TIME_PRICE_ID}}',
        quantity: 1,
      },
    ],
    invoice_creation: {
      enabled: true,
    },
    mode: 'payment',
    success_url: `${process.env.CLIENT_URL}/shop`,
    cancel_url: `${process.env.CLIENT_URL}/panier`,
  });

  return res.redirect(303, session.url);

  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

// exports.confirmOrder = async (req, res) => {
//   try{
//   // recupère la commande
//   const order = await Order.findOne({ where: { id: req.params.order_id } });
//   if (!order) {
//     return res.status(400).json({ success: false, message: "Order not found" });
//   }
//   // confirmer un PaymentIntent
//   const paymentIntent = await stripe.paymentIntents.confirm(order.stripe_pi,{
//     payment_method: req.body.payment_method,
//     payment_method_data: {
//       billing_details: {
//         name: req.body.name
//       },
//       card: {
//         number: req.body.number,
//         exp_month: req.body.exp_month,
//         exp_year: req.body.exp_year,
//         cvc: req.body.cvc
//       }
//     },
//     shipping: req.body.shipping
//   });

//   if (paymentIntent.status !== 'succeeded') {
//     return res.status(400).json({ success: false, message: "Payment failed" });
//   }

// } catch (error) {
//   return res.status(400).json({ success: false, message: error.message });
// }

exports.getAllOrders = async (req, res) => {
  try {
  // recupère tous les commandes
  const orders = await Order.findAll();
  // retourne les commandes
  res.send({
    success: true,
    data: orders
  })
  }
  catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ where: { id: req.params.order_id } });
    return res.send({
      success: true,
      data: order
    })
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}