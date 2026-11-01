const express = require('express');
const { getWishlist, toggleWishlist } = require('../controllers/wishlistController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

const router = express.Router();

router.use(protect);
router.use(authorize('consumer'));

router.get('/', getWishlist);
router.post('/:productId', toggleWishlist);

module.exports = router;
