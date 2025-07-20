const Inventory = require('../models/Inventory');
const Product = require('../models/Product');

class InventoryService {
  // Create new inventory record
  static async createInventoryRecord(inventoryData) {
    const {
      product,
      movement,
      quantity,
      reason,
      batchNumber,
      expiryDate,
      supplier,
      unitCost,
      notes
    } = inventoryData;

    // Validate product exists
    const productExists = await Product.findById(product);
    if (!productExists) {
      throw new Error('Product not found');
    }

    // Calculate new stock level
    let newStockLevel = productExists.stock;
    if (movement === 'in') {
      newStockLevel += quantity;
    } else if (movement === 'out') {
      if (newStockLevel < quantity) {
        throw new Error('Insufficient stock for outbound movement');
      }
      newStockLevel -= quantity;
    }

    // Create inventory record
    const inventory = new Inventory({
      product,
      movement,
      quantity,
      stockLevelBefore: productExists.stock,
      stockLevelAfter: newStockLevel,
      reason,
      batchNumber,
      expiryDate,
      supplier,
      unitCost,
      notes
    });

    const savedInventory = await inventory.save();

    // Update product stock
    await Product.findByIdAndUpdate(product, { stock: newStockLevel });

    return savedInventory;
  }

  // Get inventory records with filters and pagination
  static async getInventoryRecords(filters = {}, page = 1, limit = 25) {
    const startIndex = (page - 1) * limit;
    
    let query = {};

    // Filter by product
    if (filters.product) {
      query.product = filters.product;
    }

    // Filter by movement type
    if (filters.movement && filters.movement !== 'all') {
      query.movement = filters.movement;
    }

    // Filter by reason
    if (filters.reason && filters.reason !== 'all') {
      query.reason = filters.reason;
    }

    // Filter by supplier
    if (filters.supplier) {
      query.supplier = filters.supplier;
    }

    // Filter by batch number
    if (filters.batchNumber) {
      query.batchNumber = { $regex: filters.batchNumber, $options: 'i' };
    }

    // Date range filter
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.createdAt.$lte = new Date(filters.endDate);
      }
    }

    // Search functionality
    if (filters.search) {
      query.$or = [
        { batchNumber: { $regex: filters.search, $options: 'i' } },
        { supplier: { $regex: filters.search, $options: 'i' } },
        { notes: { $regex: filters.search, $options: 'i' } }
      ];
    }

    // Sorting
    let sort = {};
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'date_desc':
          sort.createdAt = -1;
          break;
        case 'date_asc':
          sort.createdAt = 1;
          break;
        case 'quantity_desc':
          sort.quantity = -1;
          break;
        case 'quantity_asc':
          sort.quantity = 1;
          break;
        case 'movement':
          sort.movement = 1;
          break;
        default:
          sort.createdAt = -1;
      }
    } else {
      sort.createdAt = -1;
    }

    const total = await Inventory.countDocuments(query);
    const records = await Inventory.find(query)
      .populate('product', 'name sku price category')
      .sort(sort)
      .limit(limit)
      .skip(startIndex);

    return {
      records,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Get inventory record by ID
  static async getInventoryRecordById(id) {
    return await Inventory.findById(id).populate('product', 'name sku price category');
  }

  // Update inventory record
  static async updateInventoryRecord(id, updateData) {
    const record = await Inventory.findById(id);
    if (!record) {
      throw new Error('Inventory record not found');
    }

    // Don't allow changing movement type or quantity after creation
    delete updateData.movement;
    delete updateData.quantity;
    delete updateData.product;

    return await Inventory.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    }).populate('product', 'name sku price category');
  }

  // Delete inventory record (soft delete)
  static async deleteInventoryRecord(id) {
    const record = await Inventory.findById(id);
    if (!record) {
      throw new Error('Inventory record not found');
    }

    // Mark as deleted instead of actually deleting
    return await Inventory.findByIdAndUpdate(id, {
      isDeleted: true,
      deletedAt: new Date()
    });
  }

  // Get low stock products
  static async getLowStockProducts() {
    const products = await Product.find({
      $expr: { $lte: ['$stock', '$threshold'] },
      isActive: true
    }).select('name sku stock threshold category price');

    return products;
  }

  // Get products with expiring stock
  static async getExpiringStock(daysAhead = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return await Inventory.find({
      expiryDate: { $lte: futureDate, $gte: new Date() },
      movement: 'in',
      isDeleted: { $ne: true }
    })
    .populate('product', 'name sku category')
    .sort({ expiryDate: 1 });
  }

  // Get inventory statistics
  static async getInventoryStats(filters = {}) {
    const matchStage = { isDeleted: { $ne: true } };

    // Date filter
    if (filters.startDate || filters.endDate) {
      matchStage.createdAt = {};
      if (filters.startDate) {
        matchStage.createdAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        matchStage.createdAt.$lte = new Date(filters.endDate);
      }
    }

    const stats = await Inventory.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalMovements: { $sum: 1 },
          totalInbound: {
            $sum: {
              $cond: [{ $eq: ['$movement', 'in'] }, '$quantity', 0]
            }
          },
          totalOutbound: {
            $sum: {
              $cond: [{ $eq: ['$movement', 'out'] }, '$quantity', 0]
            }
          },
          totalAdjustments: {
            $sum: {
              $cond: [{ $eq: ['$movement', 'adjustment'] }, '$quantity', 0]
            }
          },
          totalValue: {
            $sum: {
              $multiply: ['$quantity', '$unitCost']
            }
          },
          averageUnitCost: { $avg: '$unitCost' }
        }
      }
    ]);

    // Get movement breakdown by reason
    const movementsByReason = await Inventory.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$reason',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get top suppliers by volume
    const topSuppliers = await Inventory.aggregate([
      { 
        $match: { 
          ...matchStage,
          movement: 'in',
          supplier: { $ne: null }
        }
      },
      {
        $group: {
          _id: '$supplier',
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: { $multiply: ['$quantity', '$unitCost'] } },
          movementCount: { $sum: 1 }
        }
      },
      { $sort: { totalValue: -1 } },
      { $limit: 10 }
    ]);

    return {
      overview: stats[0] || {
        totalMovements: 0,
        totalInbound: 0,
        totalOutbound: 0,
        totalAdjustments: 0,
        totalValue: 0,
        averageUnitCost: 0
      },
      movementsByReason,
      topSuppliers
    };
  }

  // Get inventory movements for a specific product
  static async getProductMovements(productId, page = 1, limit = 25) {
    const startIndex = (page - 1) * limit;
    
    const query = { 
      product: productId,
      isDeleted: { $ne: true }
    };
    
    const total = await Inventory.countDocuments(query);
    const movements = await Inventory.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex);

    return {
      movements,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Bulk import inventory
  static async bulkImportInventory(inventoryData) {
    const results = {
      success: [],
      errors: []
    };

    for (const [index, data] of inventoryData.entries()) {
      try {
        const record = await this.createInventoryRecord(data);
        results.success.push({
          index,
          record: record._id,
          message: 'Successfully created'
        });
      } catch (error) {
        results.errors.push({
          index,
          data,
          error: error.message
        });
      }
    }

    return results;
  }

  // Stock adjustment
  static async adjustStock(productId, newStockLevel, reason, notes = '') {
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const difference = newStockLevel - product.stock;
    if (difference === 0) {
      throw new Error('No adjustment needed - stock level is already correct');
    }

    const movementType = difference > 0 ? 'in' : 'out';
    const quantity = Math.abs(difference);

    return await this.createInventoryRecord({
      product: productId,
      movement: 'adjustment',
      quantity,
      reason: reason || 'stock_adjustment',
      notes: notes || `Stock adjusted from ${product.stock} to ${newStockLevel}`
    });
  }

  // Get inventory turnover rate
  static async getInventoryTurnover(productId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const outboundMovements = await Inventory.aggregate([
      {
        $match: {
          product: productId,
          movement: 'out',
          createdAt: { $gte: startDate },
          isDeleted: { $ne: true }
        }
      },
      {
        $group: {
          _id: null,
          totalSold: { $sum: '$quantity' }
        }
      }
    ]);

    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const totalSold = outboundMovements[0]?.totalSold || 0;
    const averageInventory = product.stock; // Simplified - could be calculated from historical data
    
    const turnoverRate = averageInventory > 0 ? (totalSold / averageInventory) * (365 / days) : 0;

    return {
      productId,
      productName: product.name,
      period: `${days} days`,
      totalSold,
      currentStock: product.stock,
      turnoverRate: parseFloat(turnoverRate.toFixed(2)),
      daysOfInventory: turnoverRate > 0 ? parseFloat((365 / turnoverRate).toFixed(1)) : 0
    };
  }

  // Get stock valuation
  static async getStockValuation() {
    const valuation = await Product.aggregate([
      {
        $match: {
          isActive: true,
          stock: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: '$category',
          totalStock: { $sum: '$stock' },
          totalValue: { $sum: { $multiply: ['$stock', '$price'] } },
          productCount: { $sum: 1 },
          averagePrice: { $avg: '$price' }
        }
      },
      { $sort: { totalValue: -1 } }
    ]);

    const totalValuation = valuation.reduce((sum, category) => sum + category.totalValue, 0);

    return {
      totalValue: totalValuation,
      categoryBreakdown: valuation
    };
  }
}

module.exports = InventoryService;
