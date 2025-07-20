const Inventory = require('../models/Inventory');
const Product = require('../models/Product');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Admin
exports.getInventoryItems = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;

  let query = {};

  // Search functionality
  if (req.query.search) {
    query = {
      $or: [
        { name: { $regex: req.query.search, $options: 'i' } },
        { sku: { $regex: req.query.search, $options: 'i' } }
      ]
    };
  }

  // Filter by status
  if (req.query.status) {
    query.status = req.query.status;
  }

  // Filter by low stock
  if (req.query.lowStock === 'true') {
    query = {
      ...query,
      $expr: { $lte: ['$stock', '$threshold'] }
    };
  }

  // Filter by out of stock
  if (req.query.outOfStock === 'true') {
    query.stock = 0;
  }

  const total = await Inventory.countDocuments(query);
  const inventoryItems = await Inventory.find(query)
    .populate('product', 'name price category')
    .sort({ createdAt: -1 })
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
    count: inventoryItems.length,
    total,
    pagination,
    data: inventoryItems
  });
});

// @desc    Get single inventory item
// @route   GET /api/inventory/:id
// @access  Admin
exports.getInventoryItem = asyncHandler(async (req, res, next) => {
  const inventoryItem = await Inventory.findById(req.params.id)
    .populate('product', 'name price category images')
    .populate('movements.performedBy', 'name empid');

  if (!inventoryItem) {
    return next(new ErrorResponse(`Inventory item not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: inventoryItem
  });
});

// @desc    Create inventory item
// @route   POST /api/inventory
// @access  Admin
exports.createInventoryItem = asyncHandler(async (req, res, next) => {
  const {
    name,
    product,
    sku,
    stock,
    threshold,
    unit,
    costPrice,
    sellingPrice,
    supplier,
    location,
    reorderPoint,
    maxStock,
    storageConditions
  } = req.body;

  // Check if SKU already exists
  if (sku) {
    const existingSku = await Inventory.findOne({ sku: sku.toUpperCase() });
    if (existingSku) {
      return next(new ErrorResponse('Inventory item with this SKU already exists', 400));
    }
  }

  // Check if product reference exists
  if (product) {
    const productExists = await Product.findById(product);
    if (!productExists) {
      return next(new ErrorResponse('Referenced product not found', 404));
    }
  }

  const inventoryItem = await Inventory.create({
    name,
    product,
    sku: sku ? sku.toUpperCase() : undefined,
    stock: stock || 0,
    threshold: threshold || 10,
    unit: unit || 'g',
    costPrice,
    sellingPrice,
    supplier,
    location,
    reorderPoint,
    maxStock,
    storageConditions,
    movements: [{
      type: 'IN',
      quantity: stock || 0,
      previousStock: 0,
      newStock: stock || 0,
      reason: 'Initial stock entry',
      date: Date.now()
    }]
  });

  // Update related product stock if product reference exists
  if (product) {
    await Product.findByIdAndUpdate(product, {
      stock: stock || 0,
      threshold: threshold || 10
    });
  }

  res.status(201).json({
    success: true,
    data: inventoryItem
  });
});

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
// @access  Admin
exports.updateInventoryItem = asyncHandler(async (req, res, next) => {
  let inventoryItem = await Inventory.findById(req.params.id);

  if (!inventoryItem) {
    return next(new ErrorResponse(`Inventory item not found with id of ${req.params.id}`, 404));
  }

  // Check if SKU is being updated and if it already exists
  if (req.body.sku && req.body.sku.toUpperCase() !== inventoryItem.sku) {
    const existingSku = await Inventory.findOne({ sku: req.body.sku.toUpperCase() });
    if (existingSku) {
      return next(new ErrorResponse('Inventory item with this SKU already exists', 400));
    }
  }

  const oldStock = inventoryItem.stock;
  
  // Fields that can be updated
  const fieldsToUpdate = {
    name: req.body.name,
    sku: req.body.sku ? req.body.sku.toUpperCase() : undefined,
    stock: req.body.stock,
    threshold: req.body.threshold,
    unit: req.body.unit,
    costPrice: req.body.costPrice,
    sellingPrice: req.body.sellingPrice,
    supplier: req.body.supplier,
    location: req.body.location,
    reorderPoint: req.body.reorderPoint,
    maxStock: req.body.maxStock,
    storageConditions: req.body.storageConditions,
    status: req.body.status
  };

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(key => {
    if (fieldsToUpdate[key] === undefined) {
      delete fieldsToUpdate[key];
    }
  });

  // If stock is being updated, add movement record
  if (req.body.stock !== undefined && req.body.stock !== oldStock) {
    const movementType = req.body.stock > oldStock ? 'IN' : 'OUT';
    const quantity = Math.abs(req.body.stock - oldStock);
    
    const movement = {
      type: movementType,
      quantity,
      previousStock: oldStock,
      newStock: req.body.stock,
      reason: req.body.reason || 'Stock adjustment',
      performedBy: req.body.performedBy,
      notes: req.body.notes || ''
    };

    fieldsToUpdate.$push = { movements: movement };
  }

  inventoryItem = await Inventory.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  // Update related product stock if product reference exists
  if (inventoryItem.product && req.body.stock !== undefined) {
    await Product.findByIdAndUpdate(inventoryItem.product, {
      stock: req.body.stock,
      threshold: req.body.threshold || inventoryItem.threshold
    });
  }

  res.status(200).json({
    success: true,
    data: inventoryItem
  });
});

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Admin
exports.deleteInventoryItem = asyncHandler(async (req, res, next) => {
  const inventoryItem = await Inventory.findById(req.params.id);

  if (!inventoryItem) {
    return next(new ErrorResponse(`Inventory item not found with id of ${req.params.id}`, 404));
  }

  await Inventory.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Inventory item deleted successfully'
  });
});

// @desc    Get inventory statistics
// @route   GET /api/inventory/stats
// @access  Admin
exports.getInventoryStats = asyncHandler(async (req, res, next) => {
  const stats = await Inventory.aggregate([
    {
      $group: {
        _id: null,
        totalItems: { $sum: 1 },
        totalStock: { $sum: '$stock' },
        lowStockItems: {
          $sum: {
            $cond: [{ $lte: ['$stock', '$threshold'] }, 1, 0]
          }
        },
        outOfStockItems: {
          $sum: {
            $cond: [{ $eq: ['$stock', 0] }, 1, 0]
          }
        },
        totalValue: {
          $sum: {
            $multiply: ['$stock', { $ifNull: ['$costPrice', 0] }]
          }
        },
        averageStock: { $avg: '$stock' }
      }
    }
  ]);

  // Get low stock items
  const lowStockItems = await Inventory.find({
    $expr: { $lte: ['$stock', '$threshold'] },
    status: 'Active'
  }).select('name stock threshold sku').limit(10);

  // Get out of stock items
  const outOfStockItems = await Inventory.find({
    stock: 0,
    status: 'Active'
  }).select('name sku threshold').limit(10);

  // Get recent movements
  const recentMovements = await Inventory.aggregate([
    { $unwind: '$movements' },
    { $sort: { 'movements.date': -1 } },
    { $limit: 10 },
    {
      $project: {
        name: 1,
        sku: 1,
        movement: '$movements'
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      stats: stats[0] || {
        totalItems: 0,
        totalStock: 0,
        lowStockItems: 0,
        outOfStockItems: 0,
        totalValue: 0,
        averageStock: 0
      },
      lowStockItems,
      outOfStockItems,
      recentMovements
    }
  });
});

// @desc    Add stock movement
// @route   POST /api/inventory/:id/movement
// @access  Admin
exports.addStockMovement = asyncHandler(async (req, res, next) => {
  const { type, quantity, reason, reference, performedBy, notes } = req.body;

  if (!type || !quantity || !reason) {
    return next(new ErrorResponse('Type, quantity, and reason are required', 400));
  }

  const inventoryItem = await Inventory.findById(req.params.id);

  if (!inventoryItem) {
    return next(new ErrorResponse(`Inventory item not found with id of ${req.params.id}`, 404));
  }

  try {
    await inventoryItem.addMovement(type, quantity, reason, reference, performedBy, notes);
    
    // Update related product stock if product reference exists
    if (inventoryItem.product) {
      await Product.findByIdAndUpdate(inventoryItem.product, {
        stock: inventoryItem.stock
      });
    }

    res.status(200).json({
      success: true,
      data: inventoryItem
    });
  } catch (error) {
    return next(new ErrorResponse(error.message, 400));
  }
});

// @desc    Get low stock items
// @route   GET /api/inventory/low-stock
// @access  Admin
exports.getLowStockItems = asyncHandler(async (req, res, next) => {
  const lowStockItems = await Inventory.getLowStockItems();

  res.status(200).json({
    success: true,
    count: lowStockItems.length,
    data: lowStockItems
  });
});

// @desc    Get out of stock items
// @route   GET /api/inventory/out-of-stock
// @access  Admin
exports.getOutOfStockItems = asyncHandler(async (req, res, next) => {
  const outOfStockItems = await Inventory.getOutOfStockItems();

  res.status(200).json({
    success: true,
    count: outOfStockItems.length,
    data: outOfStockItems
  });
});

// @desc    Perform stock check
// @route   POST /api/inventory/:id/stock-check
// @access  Admin
exports.performStockCheck = asyncHandler(async (req, res, next) => {
  const { physicalCount, checkedBy, notes } = req.body;

  if (physicalCount === undefined) {
    return next(new ErrorResponse('Physical count is required', 400));
  }

  const inventoryItem = await Inventory.findById(req.params.id);

  if (!inventoryItem) {
    return next(new ErrorResponse(`Inventory item not found with id of ${req.params.id}`, 404));
  }

  const systemCount = inventoryItem.stock;
  const variance = physicalCount - systemCount;

  inventoryItem.lastStockCheck = {
    date: Date.now(),
    checkedBy,
    physicalCount,
    systemCount,
    variance,
    notes
  };

  // If there's a variance, add adjustment movement
  if (variance !== 0) {
    await inventoryItem.addMovement(
      'ADJUSTMENT',
      physicalCount,
      `Stock check adjustment. Variance: ${variance}`,
      null,
      checkedBy,
      notes
    );
  }

  await inventoryItem.save();

  res.status(200).json({
    success: true,
    data: inventoryItem
  });
});
