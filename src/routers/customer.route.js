const orderController = require('../controllers/order.controller');
const express = require('express');
const router = express.Router();
const verifyUser = require('../middlewares/verifyUser');
const verifyIsAdmin = require('../middlewares/verifyIsAdmin');

router.post('/:customer_id/orders/:order_id/refunded',verifyIsAdmin, orderController.refunded);
router.post('/:customer_id/orders/:order_id/refund', verifyUser, orderController.refund);
router.post('/:customer_id',verifyUser, orderController.createOrder);

module.exports = router;
