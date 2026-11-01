const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const FarmerProfile = require('../models/FarmerProfile');
const Category = require('../models/Category');

// @desc    Get Platform-Wide Admin Overview and Analytics
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
exports.getAdminDashboard = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalFarmers = await User.countDocuments({ role: 'farmer' });
    const totalConsumers = await User.countDocuments({ role: 'consumer' });

    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ status: 'active' });
    const pendingApprovalProducts = await Product.countDocuments({ adminApproval: 'pending' });

    const orders = await Order.find().sort({ createdAt: -1 });
    const totalOrders = orders.length;

    let totalRevenue = 0;
    let pendingOrders = 0;
    let completedOrders = 0;
    let cancelledOrders = 0;

    orders.forEach((order) => {
      if (order.overallStatus !== 'Cancelled') {
        totalRevenue += order.totalAmount;
      }
      if (order.overallStatus === 'Pending' || order.overallStatus === 'Confirmed') {
        pendingOrders++;
      } else if (order.overallStatus === 'Delivered') {
        completedOrders++;
      } else if (order.overallStatus === 'Cancelled') {
        cancelledOrders++;
      }
    });

    // Monthly revenue simulation/aggregation
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIdx = new Date().getMonth();
    const platformTrend = [];

    for (let i = 5; i >= 0; i--) {
      const mIdx = (currentMonthIdx - i + 12) % 12;
      platformTrend.push({
        month: months[mIdx],
        revenue: Math.round(totalRevenue * (0.12 + Math.random() * 0.15)),
        orders: Math.floor(totalOrders * (0.1 + Math.random() * 0.18)) || 2,
        newUsers: Math.floor(totalUsers * 0.15 + Math.random() * 5) + 1,
      });
    }

    // Category breakdown
    const categories = await Category.find();
    const categoryStats = await Promise.all(
      categories.map(async (cat) => {
        const count = await Product.countDocuments({ category: cat._id });
        return {
          name: cat.name,
          count,
        };
      })
    );

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalFarmers,
        totalConsumers,
        totalProducts,
        activeProducts,
        pendingApprovalProducts,
        totalOrders,
        totalRevenue,
        pendingOrders,
        completedOrders,
        cancelledOrders,
      },
      platformTrend,
      categoryStats,
      recentOrders: orders.slice(0, 6),
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all users with role filtering & search
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role && ['farmer', 'consumer', 'admin'].includes(role)) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      users,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle user status (Active / Deactivated / Suspended)
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { isActive, isVerified } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin' && req.user.id === user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot deactivate your own admin account' });
    }

    if (isActive !== undefined) user.isActive = isActive;
    if (isVerified !== undefined) user.isVerified = isVerified;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User status updated successfully`,
      user,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all farmers and their verification profiles
// @route   GET /api/admin/farmers
// @access  Private (Admin)
exports.getAllFarmers = async (req, res, next) => {
  try {
    const farmers = await FarmerProfile.find()
      .populate('user', 'name email phone avatar isActive isVerified createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: farmers.length,
      farmers,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify or approve farmer account
// @route   PUT /api/admin/farmers/:id/verify
// @access  Private (Admin)
exports.verifyFarmer = async (req, res, next) => {
  try {
    const { isApproved } = req.body;
    const profile = await FarmerProfile.findByIdAndUpdate(
      req.params.id,
      { isApproved },
      { new: true }
    ).populate('user');

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Farmer profile not found' });
    }

    await User.findByIdAndUpdate(profile.user._id, { isVerified: isApproved });

    res.status(200).json({
      success: true,
      message: `Farmer ${isApproved ? 'approved and verified' : 'verification updated'}`,
      profile,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all products for admin moderation
// @route   GET /api/admin/products
// @access  Private (Admin)
exports.getAllProducts = async (req, res, next) => {
  try {
    const { status, approval, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (approval) query.adminApproval = approval;
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('farmer', 'name email phone')
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      products,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Moderate product approval status
// @route   PUT /api/admin/products/:id/approval
// @access  Private (Admin)
exports.updateProductApproval = async (req, res, next) => {
  try {
    const { adminApproval, status } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (adminApproval) product.adminApproval = adminApproval;
    if (status) product.status = status;
    await product.save();

    res.status(200).json({
      success: true,
      message: `Product listing moderation updated to ${adminApproval || status}`,
      product,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all orders across platform
// @route   GET /api/admin/orders
// @access  Private (Admin)
exports.getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.overallStatus = status;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('consumer', 'name email phone')
      .populate('items.farmer', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      orders,
    });
  } catch (err) {
    next(err);
  }
};
