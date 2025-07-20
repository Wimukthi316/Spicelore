const express = require('express');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductStats,
  addProductReview,
  getProductCategories,
  getFeaturedProducts,
  searchProducts
} = require('../controllers/productController');

const { protect, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/categories', getProductCategories);
router.get('/featured', getFeaturedProducts);
router.get('/search', searchProducts);
router.get('/:id', getProduct);

// Protected routes (require authentication)
router.post('/:id/reviews', protect, addProductReview);

// Admin only routes
router.use(protect);
router.use(authorize('admin'));

router.post('/', createProduct);
router.get('/admin/stats', getProductStats);

router
  .route('/:id')
  .put(updateProduct)
  .delete(deleteProduct);

module.exports = router;
