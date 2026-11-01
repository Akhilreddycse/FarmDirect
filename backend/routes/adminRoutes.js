const express = require('express');
const {
  getAdminDashboard,
  getAllUsers,
  updateUserStatus,
  getAllFarmers,
  verifyFarmer,
  getAllProducts,
  updateProductApproval,
  getAllOrders,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getAdminDashboard);
router.get('/users', getAllUsers);
router.put('/users/:id/status', updateUserStatus);
router.get('/farmers', getAllFarmers);
router.put('/farmers/:id/verify', verifyFarmer);
router.get('/products', getAllProducts);
router.put('/products/:id/approval', updateProductApproval);
router.get('/orders', getAllOrders);

module.exports = router;
