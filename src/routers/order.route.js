const orderController = require('../controllers/order.controller');
const express = require('express');
const router = express.Router();
const verifyUser = require('../middlewares/verifyUser');
const verifyIsAdmin = require('../middlewares/verifyIsAdmin');


router.post('/:customer_id',verifyUser, orderController.createOrder);
router.get('/',verifyIsAdmin, orderController.getAllOrders);

module.exports = router;