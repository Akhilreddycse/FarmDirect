const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const FarmerProfile = require('../models/FarmerProfile');
const ConsumerProfile = require('../models/ConsumerProfile');

// Generate JWT token helper
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'farmdirect_super_secret_jwt_key_2026';
  return jwt.sign({ id }, secret, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// @desc    Register a new user (Farmer or Consumer)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    let { name, email, password, phone, role, farmName, bio, experienceYears, farmingMethods, location } = req.body;

    // Disallow public admin registration
    if (role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin accounts cannot be registered publicly. Contact system administrator.',
      });
    }

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    email = email.trim().toLowerCase();
    const assignedRole = role === 'farmer' ? 'farmer' : 'consumer';

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists',
      });
    }

    // Create base user
    const user = await User.create({
      name,
      email,
      password,
      phone: phone || '',
      role: assignedRole,
      isActive: true,
      isVerified: assignedRole === 'consumer', // farmers can be verified by admin
    });

    // Create role-specific profile
    if (assignedRole === 'farmer') {
      await FarmerProfile.create({
        user: user._id,
        farmName: farmName || `${name}'s Organic Farm`,
        bio: bio || 'Committed to organic, sustainable farming and direct-to-table freshness.',
        experienceYears: experienceYears || 3,
        farmingMethods: farmingMethods || ['Organic', 'Natural / Vedic'],
        location: location || { village: '', district: '', state: '', pincode: '' },
        isApproved: true,
      });
    } else {
      await ConsumerProfile.create({
        user: user._id,
      });
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login user & return JWT token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    email = email.trim().toLowerCase();

    // Check for user (select password)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    // Check password match
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user._id);

    // Fetch profile if farmer
    let profile = null;
    if (user.role === 'farmer') {
      profile = await FarmerProfile.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        farmerProfile: profile,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged in user and profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    let profile = null;

    if (user.role === 'farmer') {
      profile = await FarmerProfile.findOne({ user: user._id });
    } else if (user.role === 'consumer') {
      profile = await ConsumerProfile.findOne({ user: user._id }).populate('defaultAddress');
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        farmerProfile: profile,
        consumerProfile: profile,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user profile & farm details
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, farmName, bio, experienceYears, farmingMethods } = req.body;
    let { location, avatar } = req.body;

    if (req.file) {
      avatar = `/uploads/${req.file.filename}`;
    }

    if (typeof location === 'string') {
      try {
        location = JSON.parse(location);
      } catch (e) {
        console.error('Failed to parse location:', e);
      }
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (avatar) user.avatar = avatar;
    await user.save();

    let profile = null;
    if (user.role === 'farmer') {
      profile = await FarmerProfile.findOne({ user: user._id });
      let methods = farmingMethods;
      if (typeof methods === 'string') {
        try {
          methods = JSON.parse(methods);
        } catch {
          methods = [methods];
        }
      }
      if (methods && !Array.isArray(methods)) {
        methods = [methods];
      }

      if (profile) {
        if (farmName) profile.farmName = farmName;
        if (bio) profile.bio = bio;
        if (experienceYears !== undefined) profile.experienceYears = Number(experienceYears);
        if (methods) profile.farmingMethods = methods;
        if (location) profile.location = location;
        await profile.save();
      } else {
        profile = await FarmerProfile.create({
          user: user._id,
          farmName: farmName || `${user.name}'s Farm`,
          bio: bio || 'Dedicated to growing wholesome, fresh agricultural produce with sustainable farming practices.',
          experienceYears: Number(experienceYears) || 5,
          farmingMethods: methods || ['Organic'],
          location: location || {},
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        farmerProfile: profile,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new passwords',
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password does not match',
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Forgot password / Reset token generator
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    let { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address',
      });
    }
    
    email = email.trim().toLowerCase();
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user registered with this email address',
      });
    }

    // Generate random reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    // Set expire: 1 hour
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Password reset token generated. In development mode, use this token directly to reset password.',
      resetToken,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide token and new password',
      });
    }

    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token',
      });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const jwtToken = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Password reset successful! You are now logged in.',
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};
