const FollowedFarm = require('../models/FollowedFarm');
const FarmerProfile = require('../models/FarmerProfile');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Follow a farmer
// @route   POST /api/follow/:farmerId
// @access  Private
exports.followFarmer = async (req, res, next) => {
  try {
    const { farmerId } = req.params;

    // Allow farmerId to be either User ID or FarmerProfile ID
    let farmerUser = await User.findById(farmerId);
    let farmerProfile = null;

    if (farmerUser && farmerUser.role === 'farmer') {
      farmerProfile = await FarmerProfile.findOne({ user: farmerUser._id });
    } else {
      farmerProfile = await FarmerProfile.findById(farmerId);
      if (farmerProfile) {
        farmerUser = await User.findById(farmerProfile.user);
      }
    }

    if (!farmerUser) {
      return res.status(404).json({ success: false, message: 'Farmer not found.' });
    }

    // Prevent following yourself
    if (farmerUser._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot follow yourself.' });
    }

    const updateData = { 
      consumer: req.user._id, 
      farmer: farmerUser._id 
    };
    if (farmerProfile) {
      updateData.farmerProfile = farmerProfile._id;
    }

    // Upsert — safe against race conditions
    await FollowedFarm.findOneAndUpdate(
      { consumer: req.user._id, farmer: farmerUser._id },
      { $set: updateData },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      isFollowing: true,
      message: `You are now following ${farmerProfile?.farmName || 'this farm'}!`,
    });
  } catch (err) {
    console.error('[Follow Error]', err);
    if (err.code === 11000) {
      return res.status(200).json({ success: true, isFollowing: true, message: 'Already following.' });
    }
    next(err);
  }
};

// @desc    Unfollow a farmer
// @route   DELETE /api/follow/:farmerId
// @access  Private
exports.unfollowFarmer = async (req, res, next) => {
  try {
    const { farmerId } = req.params;

    let targetUserId = farmerId;
    const profile = await FarmerProfile.findById(farmerId);
    if (profile) {
      targetUserId = profile.user;
    }

    await FollowedFarm.deleteMany({
      consumer: req.user._id,
      $or: [{ farmer: targetUserId }, { farmerProfile: farmerId }]
    });

    res.status(200).json({
      success: true,
      isFollowing: false,
      message: 'Unfollowed successfully.',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Check if the current consumer follows a specific farmer
// @route   GET /api/follow/:farmerId/status
// @access  Private
exports.getFollowStatus = async (req, res, next) => {
  try {
    const { farmerId } = req.params;

    let targetUserId = farmerId;
    const profile = await FarmerProfile.findById(farmerId);
    if (profile) {
      targetUserId = profile.user;
    }

    const record = await FollowedFarm.findOne({
      consumer: req.user._id,
      $or: [{ farmer: targetUserId }, { farmerProfile: farmerId }]
    });

    res.status(200).json({ success: true, isFollowing: !!record });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all farms followed by current consumer
// @route   GET /api/follow/my-farms
// @access  Private (Consumer)
exports.getMyFollowedFarms = async (req, res, next) => {
  try {
    const followed = await FollowedFarm.find({ consumer: req.user._id })
      .populate('farmer', 'name email avatar')
      .populate('farmerProfile', 'farmName bio location ratingAverage ratingCount farmingMethods coverImage')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: followed.length,
      farms: followed,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get latest products from all followed farms (newsfeed)
// @route   GET /api/follow/feed
// @access  Private (Consumer)
exports.getFollowedFarmsFeed = async (req, res, next) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Get all followed farmer IDs
    const followed = await FollowedFarm.find({ consumer: req.user._id }).select('farmer');
    const farmerIds = followed.map((f) => f.farmer);

    if (farmerIds.length === 0) {
      return res.status(200).json({ success: true, count: 0, total: 0, totalPages: 0, products: [] });
    }

    const query = {
      farmer: { $in: farmerIds },
      status: 'active',
      adminApproval: 'approved',
    };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('farmer', 'name avatar')
      .populate('farmerProfile', 'farmName location ratingAverage')
      .populate('category', 'name slug icon')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      products,
    });
  } catch (err) {
    next(err);
  }
};
