const express = require('express');
const {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  getOrderStats,
  updateOrderStatus,
  getUserOrders
} = require('../controllers/orderController');

const { protect, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Routes that work with or without authentication
router.post('/', optionalAuth, createOrder);

// Protected routes
router.use(protect);

// User can view their own orders
router.get('/my-orders', getUserOrders);

// User can view their own order details
router.get('/:id', getOrder);

// Admin only routes
router.use(authorize('admin'));

router.get('/', getOrders);
router.get('/admin/stats', getOrderStats);

router
  .route('/:id')
  .put(updateOrder)
  .delete(deleteOrder);

router.put('/:id/status', updateOrderStatus);

module.exports = router;
