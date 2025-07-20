const express = require('express');
const {
  getInventoryItems,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getInventoryStats,
  addStockMovement,
  getLowStockItems,
  getOutOfStockItems,
  performStockCheck
} = require('../controllers/inventoryController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected and require admin access
router.use(protect);
router.use(authorize('admin'));

router
  .route('/')
  .get(getInventoryItems)
  .post(createInventoryItem);

router.get('/stats', getInventoryStats);
router.get('/low-stock', getLowStockItems);
router.get('/out-of-stock', getOutOfStockItems);

router
  .route('/:id')
  .get(getInventoryItem)
  .put(updateInventoryItem)
  .delete(deleteInventoryItem);

router.post('/:id/movement', addStockMovement);
router.post('/:id/stock-check', performStockCheck);

module.exports = router;
