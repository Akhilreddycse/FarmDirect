const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'ONLINE', 'RAZORPAY', 'TEST_CARD', 'UPI'],
      default: 'COD',
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    status: {
      type: String,
      enum: ['Initiated', 'Completed', 'Failed', 'Refunded'],
      default: 'Initiated',
    },
    transactionNote: String,
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ order: 1, user: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
