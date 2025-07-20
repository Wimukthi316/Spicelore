const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerId: {
    type: String,
    required: [true, 'Customer ID is required'],
    trim: true,
    uppercase: true,
    match: [/^[A-Z0-9]+$/, 'Customer ID must contain only capital letters and numbers']
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    productName: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative']
    },
    total: {
      type: Number,
      required: true,
      min: [0, 'Total cannot be negative']
    }
  }],
  // For backward compatibility with frontend
  product: {
    type: String,
    required: [true, 'Product name is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal cannot be negative']
  },
  tax: {
    type: Number,
    default: 0,
    min: [0, 'Tax cannot be negative']
  },
  shippingCost: {
    type: Number,
    default: 0,
    min: [0, 'Shipping cost cannot be negative']
  },
  discount: {
    amount: {
      type: Number,
      default: 0,
      min: [0, 'Discount amount cannot be negative']
    },
    code: String,
    percentage: {
      type: Number,
      min: [0, 'Discount percentage cannot be negative'],
      max: [100, 'Discount percentage cannot exceed 100']
    }
  },
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative']
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'],
    default: 'Pending'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  paymentMethod: {
    type: String,
    enum: ['Credit Card', 'Debit Card', 'PayPal', 'Bank Transfer', 'Cash on Delivery'],
    default: 'Cash on Delivery'
  },
  shippingAddress: {
    fullName: {
      type: String,
      required: true
    },
    email: String,
    phone: String,
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true,
      default: 'Sri Lanka'
    }
  },
  billingAddress: {
    fullName: String,
    email: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  tracking: {
    trackingNumber: String,
    carrier: String,
    trackingUrl: String,
    estimatedDelivery: Date,
    actualDelivery: Date
  },
  notes: {
    customerNote: String,
    adminNote: String
  },
  date: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await this.constructor.countDocuments();
    this.orderNumber = `SPL${String(count + 1).padStart(6, '0')}`;
  }
  
  // Calculate total amount if not provided
  if (!this.totalAmount && this.items && this.items.length > 0) {
    this.subtotal = this.items.reduce((sum, item) => sum + item.total, 0);
    this.totalAmount = this.subtotal + this.tax + this.shippingCost - this.discount.amount;
  }
  
  next();
});

// Update the updatedAt field on save
orderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for better query performance
orderSchema.index({ customerId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ date: -1 });
// orderNumber index is automatically created by unique: true

// Virtual for order age in days
orderSchema.virtual('ageInDays').get(function() {
  const now = new Date();
  const orderDate = new Date(this.date);
  const diffTime = Math.abs(now - orderDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Method to check if order can be cancelled
orderSchema.methods.canBeCancelled = function() {
  return ['Pending', 'Processing'].includes(this.status);
};

// Static method to get orders by status
orderSchema.statics.getOrdersByStatus = function(status) {
  return this.find({ status: status }).sort({ date: -1 });
};

module.exports = mongoose.model('Order', orderSchema);
