const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fullName: {
      type: String,
      required: [true, 'Please provide full recipient name'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Please provide contact phone number'],
      trim: true,
    },
    houseBuilding: {
      type: String,
      required: [true, 'Please provide house/building/apartment details'],
      trim: true,
    },
    street: {
      type: String,
      required: [true, 'Please provide street/road name'],
      trim: true,
    },
    villageCity: {
      type: String,
      required: [true, 'Please provide city/town/village'],
      trim: true,
    },
    district: {
      type: String,
      required: [true, 'Please provide district'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'Please provide state'],
      trim: true,
    },
    pincode: {
      type: String,
      required: [true, 'Please provide 6-digit postal pincode'],
      trim: true,
      match: [/^[1-9][0-9]{5}$/, 'Please enter a valid 6-digit Indian PIN code'],
    },
    landmark: {
      type: String,
      default: '',
      trim: true,
    },
    addressType: {
      type: String,
      enum: ['Home', 'Work', 'Farm / Other'],
      default: 'Home',
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

addressSchema.index({ user: 1, isDefault: -1 });

module.exports = mongoose.model('Address', addressSchema);
