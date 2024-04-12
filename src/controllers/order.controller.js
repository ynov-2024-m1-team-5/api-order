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
  REFUNDED: 'refunded', 
  REFUND_ON_DEMAND: 'refund on demand'
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

exports.refund = async (req, res) => {
  try {
    // get order
    const order = await Order.findOne({ where: { id: req.params.order_id } });
    if (!order) {
      return res.status(400).json({ success: false, message: "Order not found" });
    }
    if (order.status !== orderStatus.PAID) {
      return res.status(400).json({ success: false, message: "Order can't be refunded" });
    }
  
    // change status order
    order.status = orderStatus.REFUND_ON_DEMAND;
    order.save();
    // send email to user
    const results = await sequelize.query(`SELECT * from customer WHERE id=${order.customer_id}`, { type: sequelize.QueryTypes.SELECT }); 
    const user = results[0];
    console.log({user});

    const text = `
Madame, Monsieur,\n
\n
Nous vous remercions d'avoir pris le temps de nous contacter concernant votre récente expérience avec notre site My Store. Nous comprenons l'importance de votre satisfaction en tant que client, et nous nous engageons à résoudre cette situation dans les meilleurs délais.\n
\n
Nous avons bien pris note de votre demande de remboursement intégral pour votre achat du ${order.date} d'un montant de ${order.totalPrice}€. Votre demande a été transmise à notre service concerné, qui procédera à une analyse approfondie de la situation. Nous vous tiendrons informé de l'avancement du traitement de votre demande et vous contacterons dès que possible pour vous fournir une solution appropriée.\n
\n
Dans l'intervalle, si vous avez des questions supplémentaires ou si vous avez besoin de plus amples informations, n'hésitez pas à nous contacter à tout moment. Nous sommes là pour vous assister et pour garantir votre entière satisfaction.\n
\n
Nous vous remercions de votre compréhension et de votre patience pendant que nous travaillons à résoudre cette situation. Votre satisfaction demeure notre priorité absolue.\n
\n
Cordialement,\n
\n
L'équipe de support/clientèle\n
My Store\n
Veillez ne pas répondre à cet email.
    `

    sendMail(user.email, `${user.first_name} ${user.last_name}`, 'Confirmation de prise en charge de votre demande de remboursement', text, 'My Store');
    sendMail(`ynov.team5@gmail.com`, `Admin`, 'Refund on demand', `Client ${user.first_name} ${user.last_name} asked for a refund. Order command : ${order.id}`, 'My Store');
    return res.send({
      success: true,
      data: "Mails send successfully"
    })
  } catch (err){
    return res.status(400).json({ success: false, message: "Refund failed" });
  }
}

exports.refunded = async (req, res) => {
  try {
  // get order
  const order = await Order.findOne({ where: { id: req.params.order_id } });
  if (!order) {
    return res.status(400).json({ success: false, message: "Order not found" });
  }
  // send money back to user
    const refunded = await stripe.refunds.create({ payment_intent: order.stripe_pi });
    // change status order
    order.status = orderStatus.REFUNDED;
    order.save();
    // send email to user
    const results = await sequelize.query(`SELECT * from customer WHERE id=${order.customer_id}`, { type: sequelize.QueryTypes.SELECT }); 
    const user = results[0];
    const text = `
    Madame, Monsieur,\n
    \n
    Nous vous informons que votre demande de remboursement a été traitée avec succès. Vous devriez voir le montant de ${order.totalPrice}€ apparaître sur votre compte bancaire dans les prochains jours.\n
    \n
    Nous vous remercions de votre confiance et nous espérons vous revoir bientôt sur notre site My Store.\n
    \n
    Cordialement,\n
    \n
    L'équipe de support/clientèle\n
    My Store\n
    Veillez ne pas répondre à cet email.
        `
    sendMail(user.email, `${user.first_name} ${user.last_name}`,'Confirmation de remboursement', text, 'My Store');
    return res.send({
      success: true,
      data: refunded
    })
  } catch (err) {
    return res.send({
      success: false,
      message: "Refund failed"
    });
  }
}