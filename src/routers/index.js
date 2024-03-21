const express = require('express');
const router = express.Router();
const orderRouter = require('./order.route');
const  verifyToken = require('../middlewares/verifyToken');

router.use(verifyToken);
router.use("orders", orderRouter);

module.exports = router;