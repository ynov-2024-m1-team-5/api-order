const sequelize = require('../database');
const { orderStatus } = require('../enums');
const CartProduct = require('../models/CartProduct.model');
const Order = require('../models/Order.model');
const ShoppingCart = require('../models/ShoppingCart.model');

const {Stripe} = require('stripe');
const sendMail = require('./sendMail');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const stripeWebhook = async (request, response) => {
  let event = request.body;
  // Only verify the event if you have an endpoint secret defined.
  // Otherwise use the basic event deserialized with JSON.parse
  if (endpointSecret) {
    // Get the signature sent by Stripe
    const sig = request.headers['stripe-signature'];
    
    try {
      event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`, err.message);
      return response.status(400).send(`Webhook Error: ${err.message}`);
    }
  }

  // Handle the event
  switch (event.type) {
    // case 'payment_intent.succeeded':
    //   console.log("💰 Payment received!");
    //   const paymentIntent = event.data.object;
    //   const order = await Order.findOne({ where: { stripe_pi: paymentIntent.id } });
    //   console.log({
    //     paymentIntent, order
    //   })
    //   const shoppingCart = await ShoppingCart.findOne({ where: { shoppingCartId: order.shoppingCart_id } });
    //   // change le statut du panier
    //   shoppingCart.totalPrice = 0;
    //   await shoppingCart.save();
    //   // change le statut de la commande
    //   order.status = orderStatus.PAID;
    //   order.method = paymentIntent
    //   await order.save();
    //   // change le statut des produits dans le panier
    //   await CartProduct.update({ isOrder: true }, { where: { shoppingCartId: order.shoppingCartId } });
    //   break;
    
      case 'checkout.session.completed':
        console.log("💰 Payment received!");
        const checkoutSession = event.data.object;
        console.log({checkoutSession});
        if (!checkoutSession.customer_details?.name || !checkoutSession.customer_details?.email) {
          return response.status(400).send('Bad request');
        }
        const results = await sequelize.query('SELECT * from customer WHERE email = ?', {
          replacements: [checkoutSession.customer_details.email],
          type: sequelize.QueryTypes.SELECT }); 
  
        const user = results[0];
        const order = await Order.findOne({ where: { customer_id: user.id } });
        order.stripe_pi = checkoutSession.payment_intent;
        order.totalPrice = checkoutSession.amount_total / 100;
        console.log({
         order
        })
        const shoppingCart = await ShoppingCart.findOne({ where: { shoppingCartId: order.shoppingCart_id } });
        console.log({
          shoppingCart
        })
        // change le statut du panier
        shoppingCart.totalPrice = 0;
        await shoppingCart.save();
        // change le statut de la commande
        order.status = orderStatus.PAID;
        const selectedShippingRate = await stripe.shippingRates.retrieve(checkoutSession.shipping_cost.shipping_rate);
        order.method = selectedShippingRate.display_name;
        await order.save();
        // change le statut des produits dans le panier
        await CartProduct.update({ isOrder: true }, { where: { shoppingCartId: shoppingCart.shoppingCartId } });
        sendMail(user.email,`${user.firstname} ${user.lastname}`,'Confirmation du paiement de la commande',`Votre commande a bien été enregistrée. Votre numéro de commande est le ${order.id}.`,"My Store");
        break;

      default:
      // Unexpected event type
      console.log(`Unhandled event type ${event.type}.`);
  }

  // Return a 200 response to acknowledge receipt of the event
  response.send();
}

module.exports = stripeWebhook;