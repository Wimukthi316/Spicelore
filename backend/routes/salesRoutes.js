const express = require('express');
const {
  getSales,
  getSale,
  createSale,
  updateSale,
  deleteSale,
  getSalesStats,
  getSalesByDateRange,
  getTopSellingProducts,
  createSaleFromOrder
} = require('../controllers/salesController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected and require admin access
router.use(protect);
router.use(authorize('admin'));

router
  .route('/')
  .get(getSales)
  .post(createSale);

router.get('/stats', getSalesStats);
router.get('/date-range', getSalesByDateRange);
router.get('/top-products', getTopSellingProducts);

router
  .route('/:id')
  .get(getSale)
  .put(updateSale)
  .delete(deleteSale);

router.post('/from-order/:orderId', createSaleFromOrder);

module.exports = router;
