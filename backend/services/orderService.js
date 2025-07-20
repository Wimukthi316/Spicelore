const Order = require('../models/Order');
const Product = require('../models/Product');

class OrderService {
  // Create new order
  static async createOrder(orderData) {
    const {
      customer,
      items,
      paymentMethod,
      paymentDetails,
      shippingAddress,
      billingAddress,
      appliedCoupon
    } = orderData;

    // Validate products and calculate total
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        throw new Error(`Product with ID ${item.product} not found`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product ${product.name}. Available: ${product.stock}`);
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        productDetails: {
          name: product.name,
          price: product.price,
          image: product.images[0] || '',
          sku: product.sku
        },
        quantity: item.quantity,
        price: product.price,
        total: itemTotal
      });
    }

    // Calculate taxes (assuming 8% tax rate)
    const taxRate = 0.08;
    const tax = subtotal * taxRate;

    // Calculate shipping (free shipping over $50)
    const shippingFee = subtotal > 50 ? 0 : 10;

    // Apply coupon discount if provided
    let discount = 0;
    if (appliedCoupon) {
      // This would typically validate against a coupons collection
      discount = appliedCoupon.discountAmount || 0;
    }

    const total = subtotal + tax + shippingFee - discount;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const order = new Order({
      orderNumber,
      customer,
      items: orderItems,
      status: {
        current: 'pending',
        history: [{
          status: 'pending',
          date: new Date(),
          note: 'Order placed'
        }]
      },
      payment: {
        method: paymentMethod,
        status: 'pending',
        amount: total,
        details: paymentDetails
      },
      pricing: {
        subtotal,
        tax,
        shipping: shippingFee,
        discount,
        total
      },
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    });

    const savedOrder = await order.save();

    // Update product stock
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } }
      );
    }

    return savedOrder;
  }

  // Get order by ID
  static async getOrderById(orderId) {
    return await Order.findById(orderId).populate('items.product', 'name price images sku');
  }

  // Get order by order number
  static async getOrderByNumber(orderNumber) {
    return await Order.findOne({ orderNumber }).populate('items.product', 'name price images sku');
  }

  // Get orders with filters and pagination
  static async getOrders(filters = {}, page = 1, limit = 25) {
    const startIndex = (page - 1) * limit;
    
    let query = {};

    // Filter by customer
    if (filters.customerId) {
      query['customer.userId'] = filters.customerId;
    }

    // Filter by status
    if (filters.status && filters.status !== 'all') {
      query['status.current'] = filters.status;
    }

    // Filter by payment status
    if (filters.paymentStatus && filters.paymentStatus !== 'all') {
      query['payment.status'] = filters.paymentStatus;
    }

    // Filter by date range
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.createdAt.$lte = new Date(filters.endDate);
      }
    }

    // Search by order number or customer name
    if (filters.search) {
      query.$or = [
        { orderNumber: { $regex: filters.search, $options: 'i' } },
        { 'customer.name': { $regex: filters.search, $options: 'i' } },
        { 'customer.email': { $regex: filters.search, $options: 'i' } }
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
        case 'total_desc':
          sort['pricing.total'] = -1;
          break;
        case 'total_asc':
          sort['pricing.total'] = 1;
          break;
        default:
          sort.createdAt = -1;
      }
    } else {
      sort.createdAt = -1;
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort(sort)
      .limit(limit)
      .skip(startIndex)
      .populate('items.product', 'name price images sku');

    return {
      orders,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Update order status
  static async updateOrderStatus(orderId, newStatus, note = '') {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error('Invalid order status');
    }

    // Don't allow status changes for cancelled or delivered orders
    if (order.status.current === 'cancelled' || order.status.current === 'delivered') {
      throw new Error(`Cannot update status of ${order.status.current} order`);
    }

    order.status.current = newStatus;
    order.status.history.push({
      status: newStatus,
      date: new Date(),
      note: note || `Order ${newStatus}`
    });

    // Update tracking if shipped
    if (newStatus === 'shipped' && !order.tracking.trackingNumber) {
      order.tracking.trackingNumber = `TRK-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      order.tracking.carrier = 'Standard Shipping';
    }

    // Update delivered date
    if (newStatus === 'delivered') {
      order.deliveredAt = new Date();
    }

    return await order.save();
  }

  // Update payment status
  static async updatePaymentStatus(orderId, paymentStatus, transactionId = null) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    const validPaymentStatuses = ['pending', 'completed', 'failed', 'refunded'];
    if (!validPaymentStatuses.includes(paymentStatus)) {
      throw new Error('Invalid payment status');
    }

    order.payment.status = paymentStatus;
    if (transactionId) {
      order.payment.transactionId = transactionId;
    }

    if (paymentStatus === 'completed') {
      order.payment.paidAt = new Date();
      // Auto-confirm order if payment is completed
      if (order.status.current === 'pending') {
        return await this.updateOrderStatus(orderId, 'confirmed', 'Payment completed');
      }
    }

    return await order.save();
  }

  // Cancel order
  static async cancelOrder(orderId, reason = '') {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status.current === 'delivered') {
      throw new Error('Cannot cancel delivered order');
    }

    if (order.status.current === 'cancelled') {
      throw new Error('Order is already cancelled');
    }

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } }
      );
    }

    return await this.updateOrderStatus(orderId, 'cancelled', reason || 'Order cancelled');
  }

  // Get order statistics
  static async getOrderStats(filters = {}) {
    const matchStage = {};

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

    const stats = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$pricing.total' },
          averageOrderValue: { $avg: '$pricing.total' },
          pendingOrders: {
            $sum: {
              $cond: [{ $eq: ['$status.current', 'pending'] }, 1, 0]
            }
          },
          confirmedOrders: {
            $sum: {
              $cond: [{ $eq: ['$status.current', 'confirmed'] }, 1, 0]
            }
          },
          processingOrders: {
            $sum: {
              $cond: [{ $eq: ['$status.current', 'processing'] }, 1, 0]
            }
          },
          shippedOrders: {
            $sum: {
              $cond: [{ $eq: ['$status.current', 'shipped'] }, 1, 0]
            }
          },
          deliveredOrders: {
            $sum: {
              $cond: [{ $eq: ['$status.current', 'delivered'] }, 1, 0]
            }
          },
          cancelledOrders: {
            $sum: {
              $cond: [{ $eq: ['$status.current', 'cancelled'] }, 1, 0]
            }
          }
        }
      }
    ]);

    return stats[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      pendingOrders: 0,
      confirmedOrders: 0,
      processingOrders: 0,
      shippedOrders: 0,
      deliveredOrders: 0,
      cancelledOrders: 0
    };
  }

  // Get customer orders
  static async getCustomerOrders(customerId, page = 1, limit = 10) {
    const startIndex = (page - 1) * limit;
    
    const query = { 'customer.userId': customerId };
    
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex)
      .populate('items.product', 'name price images sku');

    return {
      orders,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Process refund
  static async processRefund(orderId, amount, reason = '') {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.payment.status !== 'completed') {
      throw new Error('Cannot refund order with incomplete payment');
    }

    if (amount > order.pricing.total) {
      throw new Error('Refund amount cannot exceed order total');
    }

    // Update payment status
    order.payment.status = 'refunded';
    order.payment.refundAmount = amount;
    order.payment.refundReason = reason;
    order.payment.refundedAt = new Date();

    // Add to status history
    order.status.history.push({
      status: 'refunded',
      date: new Date(),
      note: `Refunded $${amount.toFixed(2)}${reason ? ': ' + reason : ''}`
    });

    return await order.save();
  }
}

module.exports = OrderService;
