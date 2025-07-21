const stripe = require('../config/stripe');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Product = require('../models/Product');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Create payment intent
// @route   POST /api/payment/create-intent
// @access  Private
exports.createPaymentIntent = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id }).populate({
    path: 'items.product',
    select: 'name price images stock'
  });

  if (!cart || cart.items.length === 0) {
    return next(new ErrorResponse('Cart is empty', 400));
  }

  // Validate stock availability
  for (const item of cart.items) {
    if (item.product.stock < item.quantity) {
      return next(new ErrorResponse(`Insufficient stock for ${item.product.name}`, 400));
    }
  }

  const shippingCost = 5.00;
  const totalAmount = cart.totalAmount + shippingCost;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Stripe expects amount in cents
      currency: 'usd',
      metadata: {
        userId: req.user.id.toString(),
        cartId: cart._id.toString()
      }
    });

    res.status(200).json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        amount: totalAmount,
        cartItems: cart.items.length,
        paymentIntentId: paymentIntent.id
      }
    });
  } catch (error) {
    console.error('Stripe error:', error);
    return next(new ErrorResponse('Payment processing error', 500));
  }
});

// @desc    Confirm payment and create order
// @route   POST /api/payment/confirm
// @access  Private
exports.confirmPayment = asyncHandler(async (req, res, next) => {
  const { paymentIntentId, shippingAddress } = req.body;

  if (!paymentIntentId) {
    return next(new ErrorResponse('Payment intent ID is required', 400));
  }

  try {
    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return next(new ErrorResponse('Payment not completed', 400));
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user.id }).populate({
      path: 'items.product',
      select: 'name price images stock'
    });

    if (!cart || cart.items.length === 0) {
      return next(new ErrorResponse('Cart is empty', 400));
    }

    // Validate stock and update product quantities
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      
      if (product.stock < item.quantity) {
        return next(new ErrorResponse(`Insufficient stock for ${product.name}`, 400));
      }

      // Reduce product stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Create order
    const shippingCost = 5.00;
    const totalAmount = cart.totalAmount;
    const finalAmount = totalAmount + shippingCost;

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const order = new Order({
      customerId: req.user.id.toString().toUpperCase(),
      customer: req.user.id,
      orderNumber: orderNumber,
      items: cart.items.map(item => ({
        product: item.product._id,
        productName: item.product.name,
        price: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity
      })),
      // Backward compatibility fields
      product: cart.items[0].product.name, // Use first product name for compatibility
      quantity: cart.items.reduce((total, item) => total + item.quantity, 0), // Total quantity
      subtotal: totalAmount,
      tax: 0,
      shippingCost: shippingCost,
      totalAmount: finalAmount,
      paymentMethod: 'Credit Card', // Valid enum value
      paymentStatus: 'Paid', // Valid enum value
      status: 'Pending', // Valid enum value (capital P)
      shippingAddress: {
        fullName: shippingAddress.fullName || `${shippingAddress.street} Customer`, // Generate if not provided
        street: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zipCode: shippingAddress.zipCode,
        country: shippingAddress.country || 'Sri Lanka'
      },
      paymentDetails: {
        paymentIntentId: paymentIntentId,
        amount: finalAmount
      }
    });

    await order.save();

    // Clear the cart
    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      data: {
        order: order,
        message: 'Payment successful and order created'
      }
    });

  } catch (error) {
    console.error('Payment confirmation error:', error);
    return next(new ErrorResponse('Failed to process payment confirmation', 500));
  }
});

// @desc    Get payment history
// @route   GET /api/payment/history
// @access  Private
exports.getPaymentHistory = asyncHandler(async (req, res, next) => {
  const orders = await Order.find({ customer: req.user.id })
    .sort({ createdAt: -1 })
    .populate('items.product', 'name images');

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders
  });
});
