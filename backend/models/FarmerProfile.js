const mongoose = require('mongoose');

const farmerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    farmName: {
      type: String,
      required: [true, 'Please provide your farm or enterprise name'],
      trim: true,
      maxlength: [120, 'Farm name cannot exceed 120 characters'],
    },
    bio: {
      type: String,
      default: 'Dedicated to growing wholesome, fresh agricultural produce with sustainable farming practices.',
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
    },
    experienceYears: {
      type: Number,
      default: 5,
      min: [0, 'Experience years cannot be negative'],
    },
    farmSizeAcres: {
      type: Number,
      default: 5,
    },
    farmingMethods: {
      type: [String],
      enum: ['Organic', 'Natural / Vedic', 'Hydroponic', 'Regenerative', 'Traditional', 'Zero Budget Natural Farming (ZBNF)'],
      default: ['Organic', 'Natural / Vedic'],
    },
    location: {
      village: { type: String, default: '' },
      district: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' },
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    ratingAverage: {
      type: Number,
      default: 4.8,
      min: [0, 'Rating must be at least 0'],
      max: [5, 'Rating cannot exceed 5'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    totalSalesAmount: {
      type: Number,
      default: 0,
    },
    completedOrdersCount: {
      type: Number,
      default: 0,
    },
    coverImage: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

farmerProfileSchema.index({ 'location.state': 1, 'location.district': 1, ratingAverage: -1 });

module.exports = mongoose.model('FarmerProfile', farmerProfileSchema);
