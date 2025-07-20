const express = require('express');
const {
  uploadProductImage,
  uploadProductImages,
  deleteImage
} = require('../controllers/uploadController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// Apply authorization for admin/manager roles only
router.use(authorize('admin', 'manager'));

// Routes
router.post('/product', uploadProductImage);
router.post('/products', uploadProductImages);
router.delete('/:public_id', deleteImage);

module.exports = router;
