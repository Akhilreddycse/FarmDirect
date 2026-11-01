const express = require('express');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getFarmerOrders,
  updateFarmerItemStatus,
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

const router = express.Router();

router.use(protect);

router.post('/', authorize('consumer'), createOrder);
router.get('/my-orders', authorize('consumer'), getMyOrders);
router.get('/farmer-orders', authorize('farmer', 'admin'), getFarmerOrders);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);
router.put('/:orderId/items/:itemId/status', authorize('farmer', 'admin'), updateFarmerItemStatus);

module.exports = router;
