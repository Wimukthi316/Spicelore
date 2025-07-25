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
  searchProducts,
  updateProductStock,
  purchaseProduct,
  getLowStockProducts
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
router.post('/:id/purchase', protect, purchaseProduct);

// Admin only routes
router.use(protect);
router.use(authorize('admin'));

router.post('/', createProduct);
router.get('/admin/stats', getProductStats);
router.get('/low-stock', getLowStockProducts);
router.put('/:id/stock', updateProductStock);

router
  .route('/:id')
  .put(updateProduct)
  .delete(deleteProduct);

module.exports = router;
