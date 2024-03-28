const orderController = require('../controllers/order.controller');
const express = require('express');
const router = express.Router();
const verifyUser = require('../middlewares/verifyUser');
const verifyIsAdmin = require('../middlewares/verifyIsAdmin');


router.get('/',verifyIsAdmin, orderController.getAllOrders);
router.get('/:order_id',verifyIsAdmin, orderController.getOrderById);
router.post('/:customer_id',verifyUser, orderController.createOrder);
router.patch('/:customer_id/:order_id',verifyUser, orderController.confirmOrder);

module.exports = router;