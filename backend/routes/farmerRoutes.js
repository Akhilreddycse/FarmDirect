const express = require('express');
const {
  getFarmerDashboard,
  getFarmerProfile,
  updateFarmerProfile,
} = require('../controllers/farmerController');
const { getFarmerOrders } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

const router = express.Router();

router.use(protect);
router.use(authorize('farmer', 'admin'));

router.get('/dashboard', getFarmerDashboard);
router.get('/orders', getFarmerOrders);
router.route('/profile')
  .get(getFarmerProfile)
  .put(updateFarmerProfile);

module.exports = router;
