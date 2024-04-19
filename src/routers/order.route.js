const orderController = require('../controllers/order.controller');
const express = require('express');
const router = express.Router();
const verifyIsAdmin = require('../middlewares/verifyIsAdmin');

// router.post('/:customer_id/:order_id/refunded', verifyUser, orderController.refunded);
// router.post('/:customer_id/:order_id/refund', verifyUser, orderController.refund);
// router.post('/:customer_id',verifyUser, orderController.createOrder);
// router.patch('/:customer_id/:order_id',verifyUser, orderController.confirmOrder);

router.get('/',verifyIsAdmin, orderController.getAllOrders);
router.get('/:order_id',verifyIsAdmin, orderController.getOrderById);

module.exports = router;