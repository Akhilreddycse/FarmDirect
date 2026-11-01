const Review = require('../models/Review');
const Order = require('../models/Order');
const Product = require('../models/Product');
const FarmerProfile = require('../models/FarmerProfile');

// @desc    Add review for a verified purchased product
// @route   POST /api/reviews
// @access  Private (Consumer)
exports.createReview = async (req, res, next) => {
  try {
    const { productId, orderId, rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide a written review' });
    }

    // Verify that the consumer actually purchased and received this product in this order
    const order = await Order.findOne({
      _id: orderId,
      consumer: req.user.id,
      'items.product': productId,
    });

    if (!order) {
      return res.status(400).json({
        success: false,
        message: 'You can only review products from your verified purchase orders',
      });
    }

    const orderItem = order.items.find((i) => i.product.toString() === productId);
    if (!orderItem) {
      return res.status(400).json({ success: false, message: 'Product not found in this order' });
    }

    // Check if already reviewed for this order
    const existingReview = await Review.findOne({
      product: productId,
      consumer: req.user.id,
      order: orderId,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product for this order',
      });
    }

    const review = await Review.create({
      product: productId,
      farmer: orderItem.farmer,
      consumer: req.user.id,
      order: orderId,
      rating: Number(rating),
      comment,
    });

    // Recalculate product rating
    const allProductReviews = await Review.find({ product: productId });
    const totalRating = allProductReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / allProductReviews.length;

    await Product.findByIdAndUpdate(productId, {
      ratingAverage: avgRating,
      ratingCount: allProductReviews.length,
    });

    // Recalculate farmer profile rating
    const allFarmerReviews = await Review.find({ farmer: orderItem.farmer });
    const farmerTotalRating = allFarmerReviews.reduce((sum, r) => sum + r.rating, 0);
    const farmerAvgRating = farmerTotalRating / allFarmerReviews.length;

    await FarmerProfile.findOneAndUpdate(
      { user: orderItem.farmer },
      {
        ratingAverage: farmerAvgRating,
        ratingCount: allFarmerReviews.length,
      }
    );

    res.status(201).json({
      success: true,
      message: 'Thank you for reviewing! Your feedback supports our farmers.',
      review,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
exports.getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('consumer', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (err) {
    next(err);
  }
};
