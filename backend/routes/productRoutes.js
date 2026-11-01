const express = require('express');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
  getFarmerProducts,
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const upload = require('../config/multer');

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(protect, authorize('farmer', 'admin'), upload.array('images', 5), createProduct);

router.get('/my-products', protect, authorize('farmer'), getMyProducts);
router.get('/farmer/:farmerId', getFarmerProducts);

router.route('/:id')
  .get(getProductById)
  .put(protect, authorize('farmer', 'admin'), upload.array('images', 5), updateProduct)
  .delete(protect, authorize('farmer', 'admin'), deleteProduct);

module.exports = router;
