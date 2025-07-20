const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const ErrorResponse = require('../utils/errorResponse');

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'spicelore/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [
      { width: 300, height: 300, crop: 'fill' },
      { quality: 'auto' },
      { fetch_format: 'auto' }
    ]
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new ErrorResponse('Only image files (JPEG, JPG, PNG, GIF) are allowed', 400));
    }
  }
});

// Product image storage configuration
const productStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'spicelore/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [
      { width: 800, height: 600, crop: 'fit' },
      { quality: 'auto' },
      { fetch_format: 'auto' }
    ]
  }
});

const productUpload = multer({
  storage: productStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for product images
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new ErrorResponse('Only image files (JPEG, JPG, PNG, GIF) are allowed', 400));
    }
  }
});

module.exports = {
  upload,
  productUpload,
  cloudinary
};
