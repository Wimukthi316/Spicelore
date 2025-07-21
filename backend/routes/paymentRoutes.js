const express = require('express');
const {
  createPaymentIntent,
  confirmPayment,
  getPaymentHistory
} = require('../controllers/paymentController');

const { protect } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

router.post('/create-intent', createPaymentIntent);
router.post('/confirm', confirmPayment);
router.get('/history', getPaymentHistory);

module.exports = router;
