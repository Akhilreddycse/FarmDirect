const Address = require('../models/Address');
const ConsumerProfile = require('../models/ConsumerProfile');

// @desc    Get all saved addresses for consumer
// @route   GET /api/addresses
// @access  Private (Consumer)
exports.getAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ user: req.user.id }).sort({ isDefault: -1, createdAt: -1 });
    res.status(200).json({ success: true, count: addresses.length, addresses });
  } catch (err) {
    next(err);
  }
};

// @desc    Add new address
// @route   POST /api/addresses
// @access  Private (Consumer)
exports.createAddress = async (req, res, next) => {
  try {
    const { fullName, phone, houseBuilding, street, villageCity, district, state, pincode, landmark, addressType, isDefault } = req.body;

    // If this is set as default or first address, reset others
    const addressCount = await Address.countDocuments({ user: req.user.id });
    const makeDefault = isDefault || addressCount === 0;

    if (makeDefault) {
      await Address.updateMany({ user: req.user.id }, { isDefault: false });
    }

    const address = await Address.create({
      user: req.user.id,
      fullName,
      phone,
      houseBuilding,
      street,
      villageCity,
      district,
      state,
      pincode,
      landmark: landmark || '',
      addressType: addressType || 'Home',
      isDefault: makeDefault,
    });

    if (makeDefault) {
      await ConsumerProfile.findOneAndUpdate({ user: req.user.id }, { defaultAddress: address._id });
    }

    res.status(201).json({ success: true, message: 'Address saved successfully', address });
  } catch (err) {
    next(err);
  }
};

// @desc    Update address
// @route   PUT /api/addresses/:id
// @access  Private (Consumer)
exports.updateAddress = async (req, res, next) => {
  try {
    let address = await Address.findOne({ _id: req.params.id, user: req.user.id });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    if (req.body.isDefault) {
      await Address.updateMany({ user: req.user.id }, { isDefault: false });
      await ConsumerProfile.findOneAndUpdate({ user: req.user.id }, { defaultAddress: address._id });
    }

    address = await Address.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    res.status(200).json({ success: true, message: 'Address updated successfully', address });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete address
// @route   DELETE /api/addresses/:id
// @access  Private (Consumer)
exports.deleteAddress = async (req, res, next) => {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    res.status(200).json({ success: true, message: 'Address deleted successfully' });
  } catch (err) {
    next(err);
  }
};
