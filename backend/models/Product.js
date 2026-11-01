const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    farmerProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FarmerProfile',
    },
    name: {
      type: String,
      required: [true, 'Please provide product name'],
      trim: true,
      maxlength: [120, 'Product name cannot exceed 120 characters'],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide product description'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please specify category'],
    },
    images: {
      type: [String],
      default: [],
    },
    price: {
      type: Number,
      required: [true, 'Please specify price per unit in INR'],
      min: [1, 'Price must be at least ₹1'],
    },
    originalPrice: {
      type: Number,
      default: function () {
        return this.price;
      },
    },
    unit: {
      type: String,
      required: [true, 'Please select measurement unit'],
      enum: ['kg', 'g', 'quintal', 'liter', 'ml', 'dozen', 'piece', 'bunch', 'box', 'bag'],
      default: 'kg',
    },
    availableQuantity: {
      type: Number,
      required: [true, 'Please specify available inventory quantity'],
      min: [0, 'Available quantity cannot be negative'],
      default: 10,
    },
    minOrderQuantity: {
      type: Number,
      default: 1,
      min: [1, 'Minimum order quantity must be at least 1'],
    },
    harvestDate: {
      type: Date,
      default: Date.now,
    },
    farmingMethod: {
      type: String,
      default: 'Organic',
      enum: ['Organic', 'Natural / Vedic', 'Hydroponic', 'Regenerative', 'Traditional', 'Zero Budget Natural Farming (ZBNF)'],
    },
    isOrganic: {
      type: Boolean,
      default: true,
    },
    qualityGrade: {
      type: String,
      enum: ['Grade A (Premium)', 'Grade B (Standard)', 'Certified Organic Export', 'Farm Fresh Choice'],
      default: 'Grade A (Premium)',
    },
    location: {
      village: { type: String, default: '' },
      district: { type: String, default: '' },
      state: { type: String, default: '' },
    },
    status: {
      type: String,
      enum: ['active', 'out_of_stock', 'inactive'],
      default: 'active',
    },
    adminApproval: {
      type: String,
      enum: ['approved', 'pending', 'rejected'],
      default: 'approved',
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    ratingAverage: {
      type: Number,
      default: 5.0,
      min: [0, 'Rating must be at least 0'],
      max: [5, 'Rating cannot exceed 5'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    shelfLifeDays: {
      type: Number,
      default: 7,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Slug and stock status hooks
productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + randomSuffix;
  }
  if (this.availableQuantity <= 0) {
    this.status = 'out_of_stock';
  } else if (this.status === 'out_of_stock' && this.availableQuantity > 0) {
    this.status = 'active';
  }
  next();
});

// Text search and query indexes
productSchema.index({ name: 'text', description: 'text', 'location.district': 'text' });
productSchema.index({ category: 1, status: 1, price: 1, isOrganic: 1 });
productSchema.index({ farmer: 1, status: 1 });

module.exports = mongoose.model('Product', productSchema);
