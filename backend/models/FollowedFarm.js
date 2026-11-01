const mongoose = require('mongoose');

const followedFarmSchema = new mongoose.Schema(
  {
    consumer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    farmerProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FarmerProfile',
    },
  },
  {
    timestamps: true,
  }
);

// A consumer can only follow a farmer once
followedFarmSchema.index({ consumer: 1, farmer: 1 }, { unique: true });

module.exports = mongoose.model('FollowedFarm', followedFarmSchema);
