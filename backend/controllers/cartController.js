const Cart = require('../models/Cart');
const Product = require('../models/Product');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
exports.getCart = asyncHandler(async (req, res, next) => {
  let cart = await Cart.findOne({ user: req.user.id }).populate({
    path: 'items.product',
    select: 'name price images stock unit'
  });

  if (!cart) {
    cart = new Cart({ user: req.user.id, items: [] });
    await cart.save();
  }

  res.status(200).json({
    success: true,
    data: cart
  });
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
exports.addToCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity = 1 } = req.body;

  if (!productId) {
    return next(new ErrorResponse('Product ID is required', 400));
  }

  const product = await Product.findById(productId);
  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  if (product.stock < quantity) {
    return next(new ErrorResponse('Insufficient stock', 400));
  }

  let cart = await Cart.findOne({ user: req.user.id });
  
  if (!cart) {
    cart = new Cart({ user: req.user.id, items: [] });
  }

  // Check if item already exists in cart
  const existingItemIndex = cart.items.findIndex(
    item => item.product.toString() === productId
  );

  if (existingItemIndex > -1) {
    // Update quantity if item exists
    const newQuantity = cart.items[existingItemIndex].quantity + quantity;
    
    if (product.stock < newQuantity) {
      return next(new ErrorResponse('Insufficient stock for requested quantity', 400));
    }
    
    cart.items[existingItemIndex].quantity = newQuantity;
  } else {
    // Add new item to cart
    cart.items.push({
      product: productId,
      quantity: quantity,
      price: product.price
    });
  }

  await cart.save();
  await cart.populate({
    path: 'items.product',
    select: 'name price images stock unit'
  });

  res.status(200).json({
    success: true,
    data: cart,
    message: 'Item added to cart successfully'
  });
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
// @access  Private
exports.updateCartItem = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return next(new ErrorResponse('Valid quantity is required', 400));
  }

  const product = await Product.findById(productId);
  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  if (product.stock < quantity) {
    return next(new ErrorResponse('Insufficient stock', 400));
  }

  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    return next(new ErrorResponse('Cart not found', 404));
  }

  const itemIndex = cart.items.findIndex(
    item => item.product.toString() === productId
  );

  if (itemIndex === -1) {
    return next(new ErrorResponse('Item not found in cart', 404));
  }

  cart.items[itemIndex].quantity = quantity;
  cart.items[itemIndex].price = product.price; // Update price in case it changed

  await cart.save();
  await cart.populate({
    path: 'items.product',
    select: 'name price images stock unit'
  });

  res.status(200).json({
    success: true,
    data: cart,
    message: 'Cart updated successfully'
  });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
exports.removeFromCart = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    return next(new ErrorResponse('Cart not found', 404));
  }

  cart.items = cart.items.filter(
    item => item.product.toString() !== productId
  );

  await cart.save();
  await cart.populate({
    path: 'items.product',
    select: 'name price images stock unit'
  });

  res.status(200).json({
    success: true,
    data: cart,
    message: 'Item removed from cart successfully'
  });
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id });
  
  if (!cart) {
    return next(new ErrorResponse('Cart not found', 404));
  }

  cart.items = [];
  await cart.save();

  res.status(200).json({
    success: true,
    data: cart,
    message: 'Cart cleared successfully'
  });
});
