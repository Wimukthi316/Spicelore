const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Order = require('../models/Order');

class SaleService {
  // Create new sale record
  static async createSale(saleData) {
    const {
      orderId,
      customer,
      items,
      paymentMethod,
      totalAmount,
      discount,
      tax,
      notes
    } = saleData;

    // Validate order exists if provided
    if (orderId) {
      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }
    }

    // Calculate totals for each item
    let calculatedSubtotal = 0;
    const saleItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        throw new Error(`Product with ID ${item.product} not found`);
      }

      const itemSubtotal = item.quantity * item.unitPrice;
      const itemCost = item.quantity * (product.costPrice || 0);
      const itemProfit = itemSubtotal - itemCost;

      calculatedSubtotal += itemSubtotal;

      saleItems.push({
        product: product._id,
        productDetails: {
          name: product.name,
          sku: product.sku,
          category: product.category
        },
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        unitCost: product.costPrice || 0,
        subtotal: itemSubtotal,
        cost: itemCost,
        profit: itemProfit
      });
    }

    const finalTotal = calculatedSubtotal - (discount || 0) + (tax || 0);
    const totalCost = saleItems.reduce((sum, item) => sum + item.cost, 0);
    const totalProfit = finalTotal - totalCost;

    // Generate sale number
    const saleNumber = `SALE-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const sale = new Sale({
      saleNumber,
      orderId,
      customer,
      items: saleItems,
      subtotal: calculatedSubtotal,
      discount: discount || 0,
      tax: tax || 0,
      totalAmount: finalTotal,
      totalCost,
      totalProfit,
      paymentMethod,
      notes
    });

    return await sale.save();
  }

  // Get sale by ID
  static async getSaleById(id) {
    return await Sale.findById(id)
      .populate('items.product', 'name sku price category')
      .populate('orderId', 'orderNumber status');
  }

  // Get sale by sale number
  static async getSaleBySaleNumber(saleNumber) {
    return await Sale.findOne({ saleNumber })
      .populate('items.product', 'name sku price category')
      .populate('orderId', 'orderNumber status');
  }

  // Get sales with filters and pagination
  static async getSales(filters = {}, page = 1, limit = 25) {
    const startIndex = (page - 1) * limit;
    
    let query = {};

    // Filter by customer
    if (filters.customerId) {
      query['customer.userId'] = filters.customerId;
    }

    // Filter by payment method
    if (filters.paymentMethod && filters.paymentMethod !== 'all') {
      query.paymentMethod = filters.paymentMethod;
    }

    // Filter by product
    if (filters.productId) {
      query['items.product'] = filters.productId;
    }

    // Date range filter
    if (filters.startDate || filters.endDate) {
      query.saleDate = {};
      if (filters.startDate) {
        query.saleDate.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.saleDate.$lte = new Date(filters.endDate);
      }
    }

    // Amount range filter
    if (filters.minAmount || filters.maxAmount) {
      query.totalAmount = {};
      if (filters.minAmount) {
        query.totalAmount.$gte = parseFloat(filters.minAmount);
      }
      if (filters.maxAmount) {
        query.totalAmount.$lte = parseFloat(filters.maxAmount);
      }
    }

    // Search functionality
    if (filters.search) {
      query.$or = [
        { saleNumber: { $regex: filters.search, $options: 'i' } },
        { 'customer.name': { $regex: filters.search, $options: 'i' } },
        { 'customer.email': { $regex: filters.search, $options: 'i' } },
        { notes: { $regex: filters.search, $options: 'i' } }
      ];
    }

    // Sorting
    let sort = {};
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'date_desc':
          sort.saleDate = -1;
          break;
        case 'date_asc':
          sort.saleDate = 1;
          break;
        case 'amount_desc':
          sort.totalAmount = -1;
          break;
        case 'amount_asc':
          sort.totalAmount = 1;
          break;
        case 'profit_desc':
          sort.totalProfit = -1;
          break;
        case 'profit_asc':
          sort.totalProfit = 1;
          break;
        default:
          sort.saleDate = -1;
      }
    } else {
      sort.saleDate = -1;
    }

    const total = await Sale.countDocuments(query);
    const sales = await Sale.find(query)
      .populate('items.product', 'name sku category')
      .populate('orderId', 'orderNumber')
      .sort(sort)
      .limit(limit)
      .skip(startIndex);

    return {
      sales,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Update sale
  static async updateSale(id, updateData) {
    const sale = await Sale.findById(id);
    if (!sale) {
      throw new Error('Sale not found');
    }

    // Don't allow updating critical fields after creation
    delete updateData.items;
    delete updateData.totalAmount;
    delete updateData.totalCost;
    delete updateData.totalProfit;

    return await Sale.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    })
    .populate('items.product', 'name sku category')
    .populate('orderId', 'orderNumber');
  }

  // Delete sale
  static async deleteSale(id) {
    return await Sale.findByIdAndDelete(id);
  }

  // Get sales statistics
  static async getSalesStats(filters = {}) {
    const matchStage = {};

    // Date filter
    if (filters.startDate || filters.endDate) {
      matchStage.saleDate = {};
      if (filters.startDate) {
        matchStage.saleDate.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        matchStage.saleDate.$lte = new Date(filters.endDate);
      }
    }

    const stats = await Sale.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          totalCost: { $sum: '$totalCost' },
          totalProfit: { $sum: '$totalProfit' },
          averageSaleAmount: { $avg: '$totalAmount' },
          averageProfit: { $avg: '$totalProfit' },
          totalDiscount: { $sum: '$discount' },
          totalTax: { $sum: '$tax' }
        }
      }
    ]);

    // Get payment method breakdown
    const paymentMethodStats = await Sale.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          percentage: { $sum: 1 }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    // Calculate percentages for payment methods
    const totalSalesCount = paymentMethodStats.reduce((sum, method) => sum + method.count, 0);
    paymentMethodStats.forEach(method => {
      method.percentage = totalSalesCount > 0 ? parseFloat(((method.count / totalSalesCount) * 100).toFixed(2)) : 0;
    });

    return {
      overview: stats[0] || {
        totalSales: 0,
        totalRevenue: 0,
        totalCost: 0,
        totalProfit: 0,
        averageSaleAmount: 0,
        averageProfit: 0,
        totalDiscount: 0,
        totalTax: 0
      },
      paymentMethods: paymentMethodStats
    };
  }

  // Get daily sales report
  static async getDailySalesReport(date = new Date()) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const dailyStats = await Sale.aggregate([
      {
        $match: {
          saleDate: { $gte: startOfDay, $lte: endOfDay }
        }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          totalProfit: { $sum: '$totalProfit' },
          averageSaleAmount: { $avg: '$totalAmount' }
        }
      }
    ]);

    // Get hourly breakdown
    const hourlySales = await Sale.aggregate([
      {
        $match: {
          saleDate: { $gte: startOfDay, $lte: endOfDay }
        }
      },
      {
        $group: {
          _id: { $hour: '$saleDate' },
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return {
      date: date.toISOString().split('T')[0],
      summary: dailyStats[0] || {
        totalSales: 0,
        totalRevenue: 0,
        totalProfit: 0,
        averageSaleAmount: 0
      },
      hourlyBreakdown: hourlySales
    };
  }

  // Get top selling products
  static async getTopSellingProducts(filters = {}, limit = 10) {
    const matchStage = {};

    // Date filter
    if (filters.startDate || filters.endDate) {
      matchStage.saleDate = {};
      if (filters.startDate) {
        matchStage.saleDate.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        matchStage.saleDate.$lte = new Date(filters.endDate);
      }
    }

    return await Sale.aggregate([
      { $match: matchStage },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          productName: { $first: '$items.productDetails.name' },
          productSku: { $first: '$items.productDetails.sku' },
          category: { $first: '$items.productDetails.category' },
          totalQuantitySold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' },
          totalProfit: { $sum: '$items.profit' },
          salesCount: { $sum: 1 },
          averagePrice: { $avg: '$items.unitPrice' }
        }
      },
      { $sort: { totalQuantitySold: -1 } },
      { $limit: limit }
    ]);
  }

  // Get sales by customer
  static async getCustomerSales(customerId, page = 1, limit = 10) {
    const startIndex = (page - 1) * limit;
    
    const query = { 'customer.userId': customerId };
    
    const total = await Sale.countDocuments(query);
    const sales = await Sale.find(query)
      .populate('items.product', 'name sku category')
      .sort({ saleDate: -1 })
      .limit(limit)
      .skip(startIndex);

    // Get customer summary
    const customerStats = await Sale.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalPurchases: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          averageOrderValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    return {
      sales,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      customerStats: customerStats[0] || {
        totalPurchases: 0,
        totalSpent: 0,
        averageOrderValue: 0
      }
    };
  }

  // Get profit margin analysis
  static async getProfitMarginAnalysis(filters = {}) {
    const matchStage = {};

    // Date filter
    if (filters.startDate || filters.endDate) {
      matchStage.saleDate = {};
      if (filters.startDate) {
        matchStage.saleDate.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        matchStage.saleDate.$lte = new Date(filters.endDate);
      }
    }

    const analysis = await Sale.aggregate([
      { $match: matchStage },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productDetails.category',
          totalRevenue: { $sum: '$items.subtotal' },
          totalCost: { $sum: '$items.cost' },
          totalProfit: { $sum: '$items.profit' },
          itemsSold: { $sum: '$items.quantity' },
          salesCount: { $sum: 1 }
        }
      },
      {
        $addFields: {
          profitMargin: {
            $cond: [
              { $gt: ['$totalRevenue', 0] },
              { $multiply: [{ $divide: ['$totalProfit', '$totalRevenue'] }, 100] },
              0
            ]
          }
        }
      },
      { $sort: { totalProfit: -1 } }
    ]);

    return analysis;
  }

  // Get sales trends
  static async getSalesTrends(period = 'daily', limit = 30) {
    let groupBy;
    let dateFormat;

    switch (period) {
      case 'hourly':
        groupBy = {
          year: { $year: '$saleDate' },
          month: { $month: '$saleDate' },
          day: { $dayOfMonth: '$saleDate' },
          hour: { $hour: '$saleDate' }
        };
        dateFormat = '%Y-%m-%d %H:00';
        break;
      case 'daily':
        groupBy = {
          year: { $year: '$saleDate' },
          month: { $month: '$saleDate' },
          day: { $dayOfMonth: '$saleDate' }
        };
        dateFormat = '%Y-%m-%d';
        break;
      case 'weekly':
        groupBy = {
          year: { $year: '$saleDate' },
          week: { $week: '$saleDate' }
        };
        dateFormat = '%Y-W%U';
        break;
      case 'monthly':
        groupBy = {
          year: { $year: '$saleDate' },
          month: { $month: '$saleDate' }
        };
        dateFormat = '%Y-%m';
        break;
      default:
        groupBy = {
          year: { $year: '$saleDate' },
          month: { $month: '$saleDate' },
          day: { $dayOfMonth: '$saleDate' }
        };
        dateFormat = '%Y-%m-%d';
    }

    return await Sale.aggregate([
      {
        $group: {
          _id: groupBy,
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          totalProfit: { $sum: '$totalProfit' },
          averageSaleAmount: { $avg: '$totalAmount' },
          date: { $first: { $dateToString: { format: dateFormat, date: '$saleDate' } } }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1, '_id.hour': -1 } },
      { $limit: limit }
    ]);
  }
}

module.exports = SaleService;
