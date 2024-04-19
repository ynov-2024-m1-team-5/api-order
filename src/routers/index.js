const express = require('express');
const router = express.Router();
const orderRouter = require('./order.route');
const customerRouter = require('./customer.route');
const  verifyToken = require('../middlewares/verifyToken');

router.use(verifyToken);
router.use("/orders", orderRouter);
router.use("/customers", customerRouter);

module.exports = router;