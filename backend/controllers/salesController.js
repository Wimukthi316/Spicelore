const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Order = require('../models/Order');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all sales
// @route   GET /api/Sale
// @access  Admin
exports.getSales = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;

  let query = {};

  // Search functionality
  if (req.query.search) {
    query = {
      $or: [
        { product: { $regex: req.query.search, $options: 'i' } },
        { 'customerInfo.name': { $regex: req.query.search, $options: 'i' } },
        { 'customerInfo.customerId': { $regex: req.query.search, $options: 'i' } },
        { orderNumber: { $regex: req.query.search, $options: 'i' } }
      ]
    };
  }

  // Filter by date range
  if (req.query.startDate && req.query.endDate) {
    query.date = {
      $gte: new Date(req.query.startDate),
      $lte: new Date(req.query.endDate)
    };
  }

  // Filter by status
  if (req.query.status) {
    query.status = req.query.status;
  }

  // Filter by sales channel
  if (req.query.salesChannel) {
    query.salesChannel = req.query.salesChannel;
  }

  // Filter by payment method
  if (req.query.paymentMethod) {
    query.paymentMethod = req.query.paymentMethod;
  }

  const total = await Sale.countDocuments(query);
  const sales = await Sale.find(query)
    .populate('productRef', 'name sku category')
    .populate('customer', 'name email phone')
    .populate('employee', 'name empid')
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
    count: sales.length,
    total,
    pagination,
    data: sales
  });
});

// @desc    Get single sale
// @route   GET /api/Sale/:id
// @access  Admin
exports.getSale = asyncHandler(async (req, res, next) => {
  const sale = await Sale.findById(req.params.id)
    .populate('productRef', 'name sku category images')
    .populate('customer', 'name email phone address')
    .populate('employee', 'name empid role')
    .populate('order');

  if (!sale) {
    return next(new ErrorResponse(`Sale not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: sale
  });
});

// @desc    Create sale
// @route   POST /api/Sale
// @access  Admin
exports.createSale = asyncHandler(async (req, res, next) => {
  const {
    product,
    productRef,
    quantity,
    amount,
    unitPrice,
    date,
    customer,
    customerInfo,
    order,
    orderNumber,
    employee,
    salesChannel,
    paymentMethod,
    discount,
    tax,
    cost,
    region,
    notes
  } = req.body;

  // Validate required fields
  if (!product || !quantity || !amount) {
    return next(new ErrorResponse('Product, quantity, and amount are required', 400));
  }

  // Check if product reference exists
  let productDoc = null;
  if (productRef) {
    productDoc = await Product.findById(productRef);
    if (!productDoc) {
      return next(new ErrorResponse('Referenced product not found', 404));
    }
  } else if (product) {
    // Try to find product by name
    productDoc = await Product.findOne({ name: { $regex: new RegExp(product, 'i') } });
  }

  // Validate stock if product reference exists
  if (productDoc && productDoc.stock < quantity) {
    return next(new ErrorResponse(`Insufficient stock for ${productDoc.name}. Available: ${productDoc.stock}`, 400));
  }

  const sale = await Sale.create({
    product,
    productRef: productDoc ? productDoc._id : undefined,
    quantity,
    amount,
    unitPrice: unitPrice || (amount / quantity),
    date: date || Date.now(),
    customer,
    customerInfo,
    order,
    orderNumber,
    employee,
    salesChannel: salesChannel || 'Online',
    paymentMethod: paymentMethod || 'Credit Card',
    discount,
    tax,
    cost,
    region,
    notes,
    status: 'Completed'
  });

  // Update product stock if product reference exists
  if (productDoc) {
    await Product.findByIdAndUpdate(productDoc._id, {
      $inc: { stock: -quantity }
    });
  }

  res.status(201).json({
    success: true,
    data: sale
  });
});

// @desc    Update sale
// @route   PUT /api/Sale/:id
// @access  Admin
exports.updateSale = asyncHandler(async (req, res, next) => {
  let sale = await Sale.findById(req.params.id);

  if (!sale) {
    return next(new ErrorResponse(`Sale not found with id of ${req.params.id}`, 404));
  }

  // Handle stock adjustment if quantity changes
  if (req.body.quantity && req.body.quantity !== sale.quantity && sale.productRef) {
    const quantityDiff = req.body.quantity - sale.quantity;
    
    const productDoc = await Product.findById(sale.productRef);
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

  // Fields that can be updated
  const fieldsToUpdate = {
    product: req.body.product,
    quantity: req.body.quantity,
    amount: req.body.amount,
    unitPrice: req.body.unitPrice,
    date: req.body.date,
    customerInfo: req.body.customerInfo,
    salesChannel: req.body.salesChannel,
    paymentMethod: req.body.paymentMethod,
    discount: req.body.discount,
    tax: req.body.tax,
    cost: req.body.cost,
    region: req.body.region,
    notes: req.body.notes,
    status: req.body.status
  };

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(key => {
    if (fieldsToUpdate[key] === undefined) {
      delete fieldsToUpdate[key];
    }
  });

  sale = await Sale.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: sale
  });
});

// @desc    Delete sale
// @route   DELETE /api/Sale/:id
// @access  Admin
exports.deleteSale = asyncHandler(async (req, res, next) => {
  const sale = await Sale.findById(req.params.id);

  if (!sale) {
    return next(new ErrorResponse(`Sale not found with id of ${req.params.id}`, 404));
  }

  // Restore stock if sale is being deleted and product reference exists
  if (sale.status !== 'Cancelled' && sale.productRef) {
    await Product.findByIdAndUpdate(sale.productRef, {
      $inc: { stock: sale.quantity }
    });
  }

  await Sale.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Sale deleted successfully'
  });
});

// @desc    Get sales statistics
// @route   GET /api/Sale/stats
// @access  Admin
exports.getSalesStats = asyncHandler(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  // Base match condition
  let matchCondition = { status: { $ne: 'Cancelled' } };
  
  // Add date filter if provided
  if (startDate && endDate) {
    matchCondition.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const stats = await Sale.aggregate([
    { $match: matchCondition },
    {
      $group: {
        _id: null,
        totalSales: { $sum: 1 },
        totalRevenue: { $sum: '$amount' },
        totalQuantity: { $sum: '$quantity' },
        totalProfit: { $sum: '$profit' },
        averageOrderValue: { $avg: '$amount' },
        averageProfit: { $avg: '$profit' }
      }
    }
  ]);

  // Get sales by channel
  const salesByChannel = await Sale.aggregate([
    { $match: matchCondition },
    {
      $group: {
        _id: '$salesChannel',
        count: { $sum: 1 },
        revenue: { $sum: '$amount' }
      }
    },
    { $sort: { revenue: -1 } }
  ]);

  // Get sales by payment method
  const salesByPaymentMethod = await Sale.aggregate([
    { $match: matchCondition },
    {
      $group: {
        _id: '$paymentMethod',
        count: { $sum: 1 },
        revenue: { $sum: '$amount' }
      }
    },
    { $sort: { revenue: -1 } }
  ]);

  // Get top selling products
  const topProducts = await Sale.aggregate([
    { $match: matchCondition },
    {
      $group: {
        _id: '$product',
        totalQuantity: { $sum: '$quantity' },
        totalRevenue: { $sum: '$amount' },
        salesCount: { $sum: 1 },
        averagePrice: { $avg: '$unitPrice' }
      }
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: 10 }
  ]);

  // Get daily sales for the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const dailySales = await Sale.aggregate([
    {
      $match: {
        ...matchCondition,
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
        revenue: { $sum: '$amount' },
        quantity: { $sum: '$quantity' }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    }
  ]);

  // Get recent sales
  const recentSales = await Sale.find(matchCondition)
    .populate('productRef', 'name sku')
    .sort({ date: -1 })
    .limit(10);

  res.status(200).json({
    success: true,
    data: {
      stats: stats[0] || {
        totalSales: 0,
        totalRevenue: 0,
        totalQuantity: 0,
        totalProfit: 0,
        averageOrderValue: 0,
        averageProfit: 0
      },
      salesByChannel,
      salesByPaymentMethod,
      topProducts,
      dailySales,
      recentSales
    }
  });
});

// @desc    Get sales by date range
// @route   GET /api/Sale/date-range
// @access  Admin
exports.getSalesByDateRange = asyncHandler(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return next(new ErrorResponse('Start date and end date are required', 400));
  }

  const sales = await Sale.getSalesByDateRange(startDate, endDate);

  res.status(200).json({
    success: true,
    count: sales.length,
    data: sales
  });
});

// @desc    Get top selling products
// @route   GET /api/Sale/top-products
// @access  Admin
exports.getTopSellingProducts = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  
  const topProducts = await Sale.getTopSellingProducts(limit);

  res.status(200).json({
    success: true,
    count: topProducts.length,
    data: topProducts
  });
});

// @desc    Create sale from order
// @route   POST /api/Sale/from-order/:orderId
// @access  Admin
exports.createSaleFromOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.orderId).populate('customer');

  if (!order) {
    return next(new ErrorResponse(`Order not found with id of ${req.params.orderId}`, 404));
  }

  if (order.status !== 'Delivered') {
    return next(new ErrorResponse('Can only create sales from delivered orders', 400));
  }

  // Check if sale already exists for this order
  const existingSale = await Sale.findOne({ order: order._id });
  if (existingSale) {
    return next(new ErrorResponse('Sale already exists for this order', 400));
  }

  // Create sales records for each item in the order
  const salesData = [];

  if (order.items && order.items.length > 0) {
    for (let item of order.items) {
      salesData.push({
        product: item.productName,
        productRef: item.product,
        quantity: item.quantity,
        amount: item.total,
        unitPrice: item.price,
        date: order.date,
        customer: order.customer ? order.customer._id : undefined,
        customerInfo: {
          name: order.customer ? order.customer.name : order.shippingAddress.fullName,
          email: order.customer ? order.customer.email : order.shippingAddress.email,
          customerId: order.customerId
        },
        order: order._id,
        orderNumber: order.orderNumber,
        salesChannel: 'Online',
        paymentMethod: order.paymentMethod,
        status: 'Completed'
      });
    }
  } else {
    // Fallback for old order format
    salesData.push({
      product: order.product,
      quantity: order.quantity,
      amount: order.totalAmount,
      date: order.date,
      customer: order.customer ? order.customer._id : undefined,
      customerInfo: {
        name: order.customer ? order.customer.name : order.shippingAddress.fullName,
        email: order.customer ? order.customer.email : order.shippingAddress.email,
        customerId: order.customerId
      },
      order: order._id,
      orderNumber: order.orderNumber,
      salesChannel: 'Online',
      paymentMethod: order.paymentMethod,
      status: 'Completed'
    });
  }

  const sales = await Sale.insertMany(salesData);

  res.status(201).json({
    success: true,
    count: sales.length,
    data: sales
  });
});
