const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const {
  submitContactMessage,
  getAllContactMessages,
  updateContactMessage,
  deleteContactMessage,
} = require('../controllers/contactController');

// Public - anyone can submit a contact message
router.post('/', submitContactMessage);

// Admin only - manage contact messages
router.get('/', protect, authorize('admin'), getAllContactMessages);
router.put('/:id', protect, authorize('admin'), updateContactMessage);
router.delete('/:id', protect, authorize('admin'), deleteContactMessage);

module.exports = router;
