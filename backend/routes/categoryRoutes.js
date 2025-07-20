const express = require('express');
const {
  getCategories,
  getCategory,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryTree,
  getMainCategories,
  getSubcategories,
  updateCategoryProductCount,
  getCategoryStats
} = require('../controllers/categoryController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/tree', getCategoryTree);
router.get('/main', getMainCategories);
router.get('/slug/:slug', getCategoryBySlug);
router.get('/:id', getCategory);
router.get('/:id/subcategories', getSubcategories);

// Admin only routes
router.use(protect);
router.use(authorize('admin'));

router.post('/', createCategory);
router.get('/admin/stats', getCategoryStats);

router
  .route('/:id')
  .put(updateCategory)
  .delete(deleteCategory);

router.put('/:id/product-count', updateCategoryProductCount);

module.exports = router;
