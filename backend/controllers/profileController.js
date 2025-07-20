const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { upload, cloudinary } = require('../middleware/cloudinaryUpload');

// Configure multer for avatar upload - now using Cloudinary
// This configuration is handled in middleware/cloudinaryUpload.js

// @desc    Get current user profile
// @route   GET /api/profile
// @access  Private
const getProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('-password');

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    address: {
      street: req.body.street,
      city: req.body.city,
      state: req.body.state,
      zipCode: req.body.zipCode,
      country: req.body.country
    }
  };

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(key => {
    if (fieldsToUpdate[key] === undefined) {
      delete fieldsToUpdate[key];
    }
  });

  // Remove undefined address fields
  if (fieldsToUpdate.address) {
    Object.keys(fieldsToUpdate.address).forEach(key => {
      if (fieldsToUpdate.address[key] === undefined) {
        delete fieldsToUpdate.address[key];
      }
    });
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    fieldsToUpdate,
    {
      new: true,
      runValidators: true
    }
  ).select('-password');

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Upload user avatar
// @route   PUT /api/profile/avatar
// @access  Private
const uploadAvatar = asyncHandler(async (req, res, next) => {
  upload.single('avatar')(req, res, async function (err) {
    if (err) {
      return next(new ErrorResponse(err.message, 400));
    }

    if (!req.file) {
      return next(new ErrorResponse('Please upload an image file', 400));
    }

    // Delete old avatar from Cloudinary if it exists
    const oldUser = await User.findById(req.user.id);
    if (oldUser.avatar && oldUser.avatar !== 'default-avatar.png' && oldUser.cloudinary_id) {
      try {
        await cloudinary.uploader.destroy(oldUser.cloudinary_id);
      } catch (error) {
        console.log('Error deleting old avatar:', error);
      }
    }

    // Update user with new avatar URL and Cloudinary public_id
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        avatar: req.file.path, // Cloudinary URL
        cloudinary_id: req.file.filename // Cloudinary public_id
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: user,
      message: 'Avatar uploaded successfully to Cloudinary'
    });
  });
});

// @desc    Update user password
// @route   PUT /api/profile/password
// @access  Private
const updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new ErrorResponse('Please provide current and new password', 400));
  }

  // Get user with password
  const user = await User.findById(req.user.id).select('+password');

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  // Check current password
  const isMatch = await user.matchPassword(currentPassword);

  if (!isMatch) {
    return next(new ErrorResponse('Current password is incorrect', 400));
  }

  // Validate new password
  if (newPassword.length < 6) {
    return next(new ErrorResponse('New password must be at least 6 characters', 400));
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password updated successfully'
  });
});

// @desc    Delete user account
// @route   DELETE /api/profile
// @access  Private
const deleteAccount = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Account deleted successfully'
  });
});

module.exports = {
  getProfile,
  updateProfile,
  uploadAvatar,
  updatePassword,
  deleteAccount
};
