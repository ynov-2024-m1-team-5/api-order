const orderController = require('../controllers/order.controller');
const express = require('express');
const router = express.Router();
const verifyIsAdmin = require('../middlewares/verifyIsAdmin');


router.get('/',verifyIsAdmin, orderController.getAllOrders);
router.get('/:order_id',verifyIsAdmin, orderController.getOrderById);

module.exports = router;