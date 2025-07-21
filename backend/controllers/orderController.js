const Order = require('../models/Order');
const Product = require('../models/Product');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Admin
exports.getOrders = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;

  let query = {};

  // Search functionality
  if (req.query.search) {
    query = {
      $or: [
        { customerId: { $regex: req.query.search, $options: 'i' } },
        { product: { $regex: req.query.search, $options: 'i' } },
        { orderNumber: { $regex: req.query.search, $options: 'i' } }
      ]
    };
  }

  // Filter by status
  if (req.query.status && req.query.status !== 'All') {
    query.status = req.query.status;
  }

  // Filter by date range
  if (req.query.startDate && req.query.endDate) {
    query.date = {
      $gte: new Date(req.query.startDate),
      $lte: new Date(req.query.endDate)
    };
  }

  const total = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .populate('customer', 'name email phone')
    .populate('items.product', 'name sku')
    .sort({ date: -1 })
    .limit(limit)
    .skip(startIndex);

  // Pagination result
  const pagination = {};

  if (startIndex + limit < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: orders.length,
    total,
    pagination,
    orders,
    data: orders
  });
});

// @desc    Get user's orders
// @route   GET /api/orders/my-orders
// @access  User
exports.getUserOrders = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  let query = { customer: req.user._id };

  // Filter by status if provided
  if (req.query.status && req.query.status !== 'All') {
    query.status = req.query.status;
  }

  // Search by order number or product name
  if (req.query.search) {
    query.$or = [
      { orderNumber: { $regex: req.query.search, $options: 'i' } },
      { 'items.productName': { $regex: req.query.search, $options: 'i' } }
    ];
  }

  const total = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .populate('items.product', 'name images price')
    .sort({ date: -1 })
    .limit(limit)
    .skip(startIndex);

  // Pagination result
  const pagination = {};

  if (startIndex + limit < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: orders.length,
    total,
    pagination,
    data: orders
  });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Admin/User
exports.getOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('customer', 'name email phone')
    .populate('items.product', 'name sku images');

  if (!order) {
    return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
  }

  // Check if user can access this order (admin or order owner)
  if (req.user.role !== 'admin' && order.customer.toString() !== req.user._id.toString()) {
    return next(new ErrorResponse('Not authorized to access this order', 403));
  }

  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Create order
// @route   POST /api/orders
// @access  Admin/User
exports.createOrder = asyncHandler(async (req, res, next) => {
  const {
    customerId,
    customer,
    items,
    product,
    quantity,
    status,
    date,
    shippingAddress,
    paymentMethod,
    notes
  } = req.body;

  // Validate required fields
  if (!customerId || !product || !quantity) {
    return next(new ErrorResponse('Customer ID, product, and quantity are required', 400));
  }

  // For backward compatibility, if using old format (single product)
  let orderItems = [];
  let subtotal = 0;

  if (items && items.length > 0) {
    // New format with multiple items
    for (let item of items) {
      const productDoc = await Product.findById(item.product);
      if (!productDoc) {
        return next(new ErrorResponse(`Product not found with id ${item.product}`, 404));
      }
      
      if (productDoc.stock < item.quantity) {
        return next(new ErrorResponse(`Insufficient stock for ${productDoc.name}`, 400));
      }

      const itemTotal = item.quantity * productDoc.price;
      orderItems.push({
        product: item.product,
        productName: productDoc.name,
        quantity: item.quantity,
        price: productDoc.price,
        total: itemTotal
      });
      
      subtotal += itemTotal;
    }
  } else {
    // Old format for backward compatibility
    const productDoc = await Product.findOne({ name: product });
    if (productDoc) {
      if (productDoc.stock < quantity) {
        return next(new ErrorResponse(`Insufficient stock for ${product}`, 400));
      }
      
      const itemTotal = quantity * productDoc.price;
      orderItems.push({
        product: productDoc._id,
        productName: product,
        quantity,
        price: productDoc.price,
        total: itemTotal
      });
      
      subtotal = itemTotal;
    } else {
      // If product not found, use provided data (for manual orders)
      subtotal = quantity * 10; // Default price if product not found
    }
  }

  const orderData = {
    customerId: customerId.toUpperCase(),
    customer,
    items: orderItems,
    product,
    quantity,
    subtotal,
    totalAmount: subtotal, // Will be calculated in pre-save hook
    status: status || 'Pending',
    date: date || new Date(),
    shippingAddress,
    paymentMethod: paymentMethod || 'Cash on Delivery',
    notes: notes || {}
  };

  const order = await Order.create(orderData);

  // Update product stock if product reference exists
  if (orderItems.length > 0) {
    for (let item of orderItems) {
      if (item.product) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: -item.quantity } }
        );
      }
    }
  }

  res.status(201).json({
    success: true,
    order,
    data: order
  });
});

// @desc    Update order
// @route   PUT /api/orders/:id
// @access  Admin
exports.updateOrder = asyncHandler(async (req, res, next) => {
  let order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
  }

  const {
    customerId,
    product,
    quantity,
    status,
    date,
    shippingAddress,
    paymentMethod,
    paymentStatus,
    notes,
    tracking
  } = req.body;

  // Handle stock adjustment if quantity changes
  if (quantity && quantity !== order.quantity) {
    const quantityDiff = quantity - order.quantity;
    
    // Find product if it exists
    const productDoc = await Product.findOne({ name: product || order.product });
    if (productDoc) {
      const newStock = productDoc.stock - quantityDiff;
      if (newStock < 0) {
        return next(new ErrorResponse(`Insufficient stock for ${productDoc.name}`, 400));
      }
      
      await Product.findByIdAndUpdate(
        productDoc._id,
        { $inc: { stock: -quantityDiff } }
      );
    }
  }

  // Update order fields
  const updateFields = {};
  
  if (customerId) updateFields.customerId = customerId.toUpperCase();
  if (product) updateFields.product = product;
  if (quantity) updateFields.quantity = quantity;
  if (status) updateFields.status = status;
  if (date) updateFields.date = date;
  if (shippingAddress) updateFields.shippingAddress = shippingAddress;
  if (paymentMethod) updateFields.paymentMethod = paymentMethod;
  if (paymentStatus) updateFields.paymentStatus = paymentStatus;
  if (notes) updateFields.notes = notes;
  if (tracking) updateFields.tracking = tracking;

  order = await Order.findByIdAndUpdate(
    req.params.id,
    updateFields,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    order,
    data: order
  });
});

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Admin
exports.deleteOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
  }

  // Restore stock if order is cancelled
  if (order.status !== 'Cancelled' && order.items && order.items.length > 0) {
    for (let item of order.items) {
      if (item.product) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: item.quantity } }
        );
      }
    }
  }

  await Order.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Order deleted successfully'
  });
});

// @desc    Get order statistics
// @route   GET /api/orders/stats
// @access  Admin
exports.getOrderStats = asyncHandler(async (req, res, next) => {
  const stats = await Order.aggregate([
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        pendingOrders: {
          $sum: {
            $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0]
          }
        },
        processingOrders: {
          $sum: {
            $cond: [{ $eq: ['$status', 'Processing'] }, 1, 0]
          }
        },
        shippedOrders: {
          $sum: {
            $cond: [{ $eq: ['$status', 'Shipped'] }, 1, 0]
          }
        },
        deliveredOrders: {
          $sum: {
            $cond: [{ $eq: ['$status', 'Delivered'] }, 1, 0]
          }
        },
        cancelledOrders: {
          $sum: {
            $cond: [{ $eq: ['$status', 'Cancelled'] }, 1, 0]
          }
        },
        totalRevenue: { $sum: '$totalAmount' },
        averageOrderValue: { $avg: '$totalAmount' }
      }
    }
  ]);

  // Get recent orders
  const recentOrders = await Order.find()
    .populate('customer', 'name email')
    .sort({ date: -1 })
    .limit(10);

  // Get daily orders for the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const dailyOrders = await Order.aggregate([
    {
      $match: {
        date: { $gte: thirtyDaysAgo }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          day: { $dayOfMonth: '$date' }
        },
        count: { $sum: 1 },
        revenue: { $sum: '$totalAmount' }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      stats: stats[0] || {
        totalOrders: 0,
        pendingOrders: 0,
        processingOrders: 0,
        shippedOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0
      },
      recentOrders,
      dailyOrders
    }
  });
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Admin
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  if (!status) {
    return next(new ErrorResponse('Status is required', 400));
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
  }

  order.status = status;
  order.updatedAt = Date.now();

  // Add tracking information if order is shipped
  if (status === 'Shipped' && req.body.tracking) {
    order.tracking = req.body.tracking;
  }

  await order.save();

  res.status(200).json({
    success: true,
    data: order
  });
});
