const express = require('express');
const { createReview, getProductReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

const router = express.Router();

router.get('/product/:productId', getProductReviews);
router.post('/', protect, authorize('consumer'), createReview);

module.exports = router;
