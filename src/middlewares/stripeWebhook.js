const sequelize = require('../database');
const CartProduct = require('../models/CartProduct.model');
const Order = require('../models/Order.model');
const ShoppingCart = require('../models/ShoppingCart.model');

const {Stripe} = require('stripe')
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.stripeWebhook = async (request, response) => {
  let event = request.body;
  // Only verify the event if you have an endpoint secret defined.
  // Otherwise use the basic event deserialized with JSON.parse
  if (endpointSecret) {
    // Get the signature sent by Stripe
    const signature = request.headers['stripe-signature'];
    try {
      event = stripe.webhooks.constructEvent(
        request.body,
        signature,
        endpointSecret
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`, err.message);
      return response.sendStatus(400);
    }
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
    const paymentIntent = event.data.object;
    const order = await Order.findOne({ where: { stripe_pi: paymentIntent.id } });
    const shoppingCart = await ShoppingCart.findOne({ where: { shoppingCartId: order.shoppingCart_id } });
    
    // change le statut du panier
    shoppingCart.totalPrice = 0;
    await shoppingCart.save();
    // change le statut de la commande
    order.status = orderStatus.PAID;
    await order.save();
    // change le statut des produits dans le panier
    await CartProduct.update({ isOrder: true }, { where: { shoppingCartId: order.shoppingCartId } });

    //envoie un email de confirmation
    const results = await sequelize.query(`SELECT * from customer WHERE id=${order.customer_id}`, { type: sequelize.QueryTypes.SELECT }); 
    const user = results[0];
    sendMail(user.email, `${user.fist_name} ${user.fist_name}`, 'Order Confirmation', `Your order has been confirmed.`, 'Ecommerce App');
      break;
    case 'payment_method.attached':
      const paymentMethod = event.data.object;
      // Then define and call a method to handle the successful attachment of a PaymentMethod.
      // handlePaymentMethodAttached(paymentMethod);
      break;
    default:
      // Unexpected event type
      console.log(`Unhandled event type ${event.type}.`);
  }

  // Return a 200 response to acknowledge receipt of the event
  response.send();
}