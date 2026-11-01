const Product = require('../models/Product');
const Category = require('../models/Category');
const FarmerProfile = require('../models/FarmerProfile');
const Review = require('../models/Review');
const FollowedFarm = require('../models/FollowedFarm');
const Notification = require('../models/Notification');

// @desc    Get all products with search, multi-filters, sorting, and pagination
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    const {
      keyword,
      category,
      minPrice,
      maxPrice,
      organic,
      farmingMethod,
      state,
      district,
      qualityGrade,
      status = 'active',
      sort = 'newest',
      page = 1,
      limit = 12,
      featured,
    } = req.query;

    const query = {};

    // Filter by approval & status for public browsing
    query.adminApproval = 'approved';
    if (status) query.status = status;

    // Search keyword in name, description or district
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { 'location.district': { $regex: keyword, $options: 'i' } },
        { 'location.state': { $regex: keyword, $options: 'i' } },
      ];
    }

    // Category filter by ID or slug
    if (category) {
      const catDoc = await Category.findOne({
        $or: [{ _id: category.match(/^[0-9a-fA-F]{24}$/) ? category : null }, { slug: category }],
      });
      if (catDoc) {
        query.category = catDoc._id;
      }
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Organic filter
    if (organic !== undefined && organic !== '') {
      query.isOrganic = organic === 'true' || organic === true;
    }

    // Farming method
    if (farmingMethod) {
      query.farmingMethod = farmingMethod;
    }

    // Quality grade
    if (qualityGrade) {
      query.qualityGrade = qualityGrade;
    }

    // Location filters
    if (state) {
      query['location.state'] = { $regex: state, $options: 'i' };
    }
    if (district) {
      query['location.district'] = { $regex: district, $options: 'i' };
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (sort === 'price_asc') sortOptions = { price: 1 };
    else if (sort === 'price_desc') sortOptions = { price: -1 };
    else if (sort === 'rating') sortOptions = { ratingAverage: -1, ratingCount: -1 };
    else if (sort === 'popular') sortOptions = { viewsCount: -1 };
    else if (sort === 'newest') sortOptions = { createdAt: -1 };

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    const totalProducts = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug icon')
      .populate('farmer', 'name email phone avatar')
      .populate('farmerProfile', 'farmName location ratingAverage ratingCount')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: products.length,
      total: totalProducts,
      totalPages: Math.ceil(totalProducts / limitNum),
      currentPage: pageNum,
      products,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single product by ID or slug with reviews
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res, next) => {
  try {
    const isObjectId = req.params.id.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: req.params.id } : { slug: req.params.id };

    const product = await Product.findOne(query)
      .populate('category', 'name slug icon description')
      .populate('farmer', 'name email phone avatar')
      .populate('farmerProfile');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Increment view count asynchronously
    product.viewsCount += 1;
    await product.save({ validateBeforeSave: false });

    // Fetch verified reviews for this product
    const reviews = await Review.find({ product: product._id })
      .populate('consumer', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(10);

    // Fetch related products from same category or same farmer
    const relatedProducts = await Product.find({
      category: product.category._id,
      _id: { $ne: product._id },
      status: 'active',
      adminApproval: 'approved',
    })
      .limit(4)
      .populate('farmer', 'name');

    res.status(200).json({
      success: true,
      product,
      reviews,
      relatedProducts,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new product listing
// @route   POST /api/products
// @access  Private (Farmer only)
exports.createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      category,
      price,
      originalPrice,
      unit,
      availableQuantity,
      minOrderQuantity,
      harvestDate,
      farmingMethod,
      isOrganic,
      qualityGrade,
      location,
      shelfLifeDays,
      isFeatured,
      images: providedImages,
    } = req.body;

    // Retrieve farmer profile
    const farmerProfile = await FarmerProfile.findOne({ user: req.user.id });

    // Extract uploaded files if multer processed them
    let imagePaths = [];
    if (req.files && req.files.length > 0) {
      imagePaths = req.files.map((file) => `/uploads/${file.filename}`);
    } else if (providedImages && Array.isArray(providedImages)) {
      imagePaths = providedImages;
    } else if (typeof providedImages === 'string') {
      imagePaths = [providedImages];
    }

    const product = await Product.create({
      farmer: req.user.id,
      farmerProfile: farmerProfile ? farmerProfile._id : null,
      name,
      description,
      category,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : Number(price),
      unit: unit || 'kg',
      availableQuantity: Number(availableQuantity),
      minOrderQuantity: minOrderQuantity ? Number(minOrderQuantity) : 1,
      harvestDate: harvestDate || new Date(),
      farmingMethod: farmingMethod || 'Organic',
      isOrganic: isOrganic === 'true' || isOrganic === true,
      qualityGrade: qualityGrade || 'Grade A (Premium)',
      location: location || (farmerProfile ? farmerProfile.location : {}),
      shelfLifeDays: shelfLifeDays ? Number(shelfLifeDays) : 7,
      isFeatured: isFeatured === 'true' || isFeatured === true,
      images: imagePaths,
      adminApproval: 'approved', // Auto-approved or pending based on system setting
    });

    // Update category item count
    await Category.findByIdAndUpdate(category, { $inc: { itemCount: 1 } });

    // --- Notify all followers of this farmer ---
    try {
      const followers = await FollowedFarm.find({ farmer: req.user.id }).select('consumer');
      if (followers.length > 0) {
        const farmName = farmerProfile?.farmName || req.user.name;
        const notifDocs = followers.map((f) => ({
          recipient: f.consumer,
          title: `🌱 New Product from ${farmName}!`,
          message: `${farmName} just listed a new product: "${product.name}". Check it out before it sells out!`,
          type: 'product',
          link: `/products/${product._id}`,
        }));
        await Notification.insertMany(notifDocs);
      }
    } catch (notifErr) {
      // Non-blocking — don't fail product creation if notification fails
      console.warn('[Notify Followers] Failed to send follow notifications:', notifErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Product listing created successfully',
      product,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a product listing
// @route   PUT /api/products/:id
// @access  Private (Farmer owner or Admin)
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Verify ownership or admin role
    if (product.farmer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this product listing',
      });
    }

    // Extract uploaded files if any
    let updatedImages = product.images;
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => `/uploads/${file.filename}`);
      updatedImages = [...updatedImages, ...newImages];
    } else if (req.body.images && Array.isArray(req.body.images)) {
      updatedImages = req.body.images;
    }

    const updates = { ...req.body };
    if (updatedImages.length > 0) {
      updates.images = updatedImages;
    }

    product = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a product listing
// @route   DELETE /api/products/:id
// @access  Private (Farmer owner or Admin)
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.farmer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this product listing',
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    // Decrement category count
    await Category.findByIdAndUpdate(product.category, { $inc: { itemCount: -1 } });

    res.status(200).json({
      success: true,
      message: 'Product listing removed successfully',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get products listed by logged-in farmer
// @route   GET /api/products/my-products
// @access  Private (Farmer only)
exports.getMyProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ farmer: req.user.id })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get public products of a specific farmer
// @route   GET /api/products/farmer/:farmerId
// @access  Public
exports.getFarmerProducts = async (req, res, next) => {
  try {
    let targetUserId = req.params.farmerId;
    let farmerProfile = await FarmerProfile.findOne({ user: targetUserId }).populate('user', 'name avatar email phone');

    if (!farmerProfile) {
      farmerProfile = await FarmerProfile.findById(req.params.farmerId).populate('user', 'name avatar email phone');
      if (farmerProfile) {
        targetUserId = farmerProfile.user?._id || farmerProfile.user;
      }
    }

    const products = await Product.find({
      farmer: targetUserId,
      status: 'active',
      adminApproval: 'approved',
    }).populate('category', 'name slug');

    res.status(200).json({
      success: true,
      farmerProfile,
      count: products.length,
      products,
    });
  } catch (err) {
    next(err);
  }
};
