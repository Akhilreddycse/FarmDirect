const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');
const FarmerProfile = require('../models/FarmerProfile');

// @desc    Get complete Farmer Dashboard statistics and analytics
// @route   GET /api/farmer/dashboard
// @access  Private (Farmer)
exports.getFarmerDashboard = async (req, res, next) => {
  try {
    const farmerId = req.user.id;

    // 1. Product Statistics
    const allProducts = await Product.find({ farmer: farmerId });
    const totalProducts = allProducts.length;
    const activeProducts = allProducts.filter((p) => p.status === 'active' && p.availableQuantity > 0).length;
    const outOfStockProducts = allProducts.filter((p) => p.availableQuantity <= 0 || p.status === 'out_of_stock').length;
    const lowStockProducts = allProducts.filter((p) => p.availableQuantity > 0 && p.availableQuantity <= 5);

    // 2. Orders Statistics
    const orders = await Order.find({ 'items.farmer': farmerId }).sort({ createdAt: -1 });
    const totalOrders = orders.length;

    let totalEarnings = 0;
    let pendingOrdersCount = 0;
    let completedOrdersCount = 0;
    let processingOrdersCount = 0;

    // Category breakdown and sales data
    const categorySales = {};

    orders.forEach((order) => {
      const myItems = order.items.filter((item) => item.farmer.toString() === farmerId);
      const mySubtotal = myItems.reduce((sum, item) => sum + item.subtotal, 0);

      if (['Delivered', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery'].includes(order.overallStatus)) {
        totalEarnings += mySubtotal;
      }

      if (order.overallStatus === 'Pending' || order.overallStatus === 'Confirmed') {
        pendingOrdersCount++;
      } else if (order.overallStatus === 'Delivered') {
        completedOrdersCount++;
      } else if (['Processing', 'Packed', 'Shipped'].includes(order.overallStatus)) {
        processingOrdersCount++;
      }
    });

    // 3. Monthly Earnings Trend (Real data from last 6 months)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const monthlyAgg = await Order.aggregate([
      {
        $match: {
          'items.farmer': new mongoose.Types.ObjectId(farmerId),
          createdAt: { $gte: sixMonthsAgo },
          overallStatus: { $nin: ['Cancelled'] },
        },
      },
      { $unwind: '$items' },
      {
        $match: {
          'items.farmer': new mongoose.Types.ObjectId(farmerId),
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          sales: { $sum: '$items.subtotal' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Build a map of real data keyed by "YYYY-MM"
    const aggMap = {};
    monthlyAgg.forEach((m) => {
      aggMap[`${m._id.year}-${m._id.month}`] = { sales: Math.round(m.sales), orders: m.orders };
    });

    // Fill 6-month array (including months with zero sales)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      monthlyTrend.push({
        month: months[d.getMonth()],
        sales: aggMap[key]?.sales || 0,
        orders: aggMap[key]?.orders || 0,
      });
    }

    // 4. Recent orders for dashboard table
    const recentOrders = orders.slice(0, 5).map((order) => {
      const myItems = order.items.filter((i) => i.farmer.toString() === farmerId);
      return {
        _id: order._id,
        orderNumber: order.orderNumber,
        consumerName: order.shippingAddress?.fullName || 'Customer',
        itemsCount: myItems.length,
        totalAmount: myItems.reduce((s, i) => s + i.subtotal, 0),
        status: order.overallStatus,
        createdAt: order.createdAt,
      };
    });

    const profile = await FarmerProfile.findOne({ user: farmerId });

    res.status(200).json({
      success: true,
      stats: {
        totalProducts,
        activeProducts,
        outOfStockProducts,
        lowStockCount: lowStockProducts.length,
        totalOrders,
        pendingOrdersCount,
        processingOrdersCount,
        completedOrdersCount,
        totalEarnings,
        ratingAverage: profile?.ratingAverage || 4.8,
        ratingCount: profile?.ratingCount || 0,
      },
      lowStockAlerts: lowStockProducts.map((p) => ({
        _id: p._id,
        name: p.name,
        availableQuantity: p.availableQuantity,
        unit: p.unit,
      })),
      monthlyTrend,
      recentOrders,
      farmerProfile: profile,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get logged in Farmer profile
// @route   GET /api/farmer/profile
// @access  Private (Farmer)
exports.getFarmerProfile = async (req, res, next) => {
  try {
    let profile = await FarmerProfile.findOne({ user: req.user.id }).populate('user', 'name email phone avatar');
    if (!profile) {
      const user = await User.findById(req.user.id);
      profile = await FarmerProfile.create({
        user: req.user.id,
        farmName: `${user?.name || 'My'}'s Farm`,
        bio: 'Dedicated to growing wholesome, fresh agricultural produce with sustainable farming practices.',
        experienceYears: 5,
        farmingMethods: ['Organic'],
        location: {},
      });
      profile = await FarmerProfile.findById(profile._id).populate('user', 'name email phone avatar');
    }
    res.status(200).json({ success: true, profile });
  } catch (err) {
    next(err);
  }
};

// @desc    Update logged in Farmer profile
// @route   PUT /api/farmer/profile
// @access  Private (Farmer)
exports.updateFarmerProfile = async (req, res, next) => {
  try {
    const profile = await FarmerProfile.findOneAndUpdate(
      { user: req.user.id },
      { $set: req.body },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );
    res.status(200).json({ success: true, message: 'Farm profile updated successfully', profile });
  } catch (err) {
    next(err);
  }
};
