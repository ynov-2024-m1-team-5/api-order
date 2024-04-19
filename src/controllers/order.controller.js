const {Stripe} = require('stripe')
const Order = require('../models/Order.model');
const ShoppingCart = require('../models/ShoppingCart.model');
const CartProduct = require('../models/CartProduct.model');
const sendMail = require('../middlewares/sendMail');
const sequelize = require('../database');
const Product = require('../models/Product.model');
const {orderStatus} = require('../enums');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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

const cartProducts = await CartProduct.findAll({
  where: {
      shoppingCartId: shoppingCart.shoppingCartId
  },
});

const line_items = await Promise.all(cartProducts.map( async cartProduct => {
  const product = await Product.findOne({ where: { id: cartProduct.productId } });
  const item = {
    price_data: {
      currency: 'eur',
      product_data: {
        name: product.name,
        images: [product.thumbnail],
        description: product.description
      },
      unit_amount: product.price * 100,
    },
    quantity: cartProduct.quantitySelected
  }
  console.log({product,item});

  return item;
}))

console.log({line_items});

  //Paiement
  const results = await sequelize.query(`SELECT * from customer WHERE id=${req.userToken.customer_id}`, { type: sequelize.QueryTypes.SELECT }); 
  const user = results[0];
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
   line_items,
    invoice_creation: {
      enabled: true,
    },
    shipping_address_collection: {
      allowed_countries: ['FR'],
    },
    shipping_options: [
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: {
            amount: 0,
            currency: 'eur',
          },
          display_name: 'Livraison standard',
          delivery_estimate: {
            minimum: {
              unit: 'business_day',
              value: 5,
            },
            maximum: {
              unit: 'business_day',
              value: 7,
            },
          },
        },
      },
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: {
            amount: 599,
            currency: 'eur',
          },
          display_name: 'Livraison rapide',
          delivery_estimate: {
            minimum: {
              unit: 'business_day',
              value: 1,
            },
            maximum: {
              unit: 'business_day',
              value: 1,
            },
          },
        },
      },
    ],
    customer_email: user.email,
    mode: 'payment',
    success_url: `${process.env.CLIENT_URL}/shop`,
    cancel_url: `${process.env.CLIENT_URL}/panier`,
  });

  // enregistre l'id de la session de paiement
  order.stripe_pi = session.payment_intent;
  await order.save();

  console.log({order,session})
  
  return res.send({success:true, url: session.url})

  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

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