const express = require('express');
const { createPaymentOrder, verifyPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

const router = express.Router();

router.use(protect);
router.use(authorize('consumer'));

router.post('/create-order', createPaymentOrder);
router.post('/verify', verifyPayment);

module.exports = router;
