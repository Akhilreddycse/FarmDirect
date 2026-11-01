const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      trim: true,
      lowercase: true,
    },
    subject: {
      type: String,
      trim: true,
      default: 'General Inquiry',
    },
    message: {
      type: String,
      required: [true, 'Please provide a message'],
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ['New', 'Read', 'Replied', 'Resolved'],
      default: 'New',
    },
    adminNotes: {
      type: String,
      default: '',
    },
    repliedAt: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
