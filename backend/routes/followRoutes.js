const express = require('express');
const {
  followFarmer,
  unfollowFarmer,
  getFollowStatus,
  getMyFollowedFarms,
  getFollowedFarmsFeed,
} = require('../controllers/followController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All follow routes require login
router.use(protect);

router.get('/my-farms', getMyFollowedFarms);
router.get('/feed', getFollowedFarmsFeed);
router.get('/:farmerId/status', getFollowStatus);
router.post('/:farmerId', followFarmer);
router.delete('/:farmerId', unfollowFarmer);

module.exports = router;
