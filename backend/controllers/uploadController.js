const { productUpload, cloudinary } = require('../middleware/cloudinaryUpload');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Upload single product image
// @route   POST /api/upload/product
// @access  Private (Admin/Manager)
const uploadProductImage = asyncHandler(async (req, res, next) => {
  productUpload.single('image')(req, res, async function (err) {
    if (err) {
      return next(new ErrorResponse(err.message, 400));
    }

    if (!req.file) {
      return next(new ErrorResponse('Please upload an image file', 400));
    }

    res.status(200).json({
      success: true,
      data: {
        url: req.file.path,
        public_id: req.file.filename
      },
      message: 'Image uploaded successfully to Cloudinary'
    });
  });
});

// @desc    Upload multiple product images
// @route   POST /api/upload/products
// @access  Private (Admin/Manager)
const uploadProductImages = asyncHandler(async (req, res, next) => {
  productUpload.array('images', 5)(req, res, async function (err) {
    if (err) {
      return next(new ErrorResponse(err.message, 400));
    }

    if (!req.files || req.files.length === 0) {
      return next(new ErrorResponse('Please upload at least one image file', 400));
    }

    const uploadedImages = req.files.map(file => ({
      url: file.path,
      public_id: file.filename
    }));

    res.status(200).json({
      success: true,
      data: uploadedImages,
      message: `${uploadedImages.length} images uploaded successfully to Cloudinary`
    });
  });
});

// @desc    Delete image from Cloudinary
// @route   DELETE /api/upload/:public_id
// @access  Private (Admin/Manager)
const deleteImage = asyncHandler(async (req, res, next) => {
  const { public_id } = req.params;

  if (!public_id) {
    return next(new ErrorResponse('Public ID is required', 400));
  }

  try {
    const result = await cloudinary.uploader.destroy(public_id);
    
    if (result.result === 'ok') {
      res.status(200).json({
        success: true,
        message: 'Image deleted successfully from Cloudinary'
      });
    } else {
      return next(new ErrorResponse('Failed to delete image from Cloudinary', 400));
    }
  } catch (error) {
    return next(new ErrorResponse('Error deleting image from Cloudinary', 500));
  }
});

module.exports = {
  uploadProductImage,
  uploadProductImages,
  deleteImage
};
