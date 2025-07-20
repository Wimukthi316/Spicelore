const mongoose = require('mongoose');

const salesSchema = new mongoose.Schema({
  product: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot be more than 100 characters']
  },
  productRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  unitPrice: {
    type: Number,
    min: [0, 'Unit price cannot be negative']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  customerInfo: {
    name: String,
    email: String,
    phone: String,
    customerId: String
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  orderNumber: String,
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  salesChannel: {
    type: String,
    enum: ['Online', 'In-Store', 'Phone', 'Email', 'Social Media'],
    default: 'Online'
  },
  paymentMethod: {
    type: String,
    enum: ['Credit Card', 'Debit Card', 'PayPal', 'Bank Transfer', 'Cash', 'Store Credit'],
    default: 'Credit Card'
  },
  discount: {
    amount: {
      type: Number,
      default: 0,
      min: [0, 'Discount amount cannot be negative']
    },
    percentage: {
      type: Number,
      default: 0,
      min: [0, 'Discount percentage cannot be negative'],
      max: [100, 'Discount percentage cannot exceed 100']
    },
    code: String,
    reason: String
  },
  tax: {
    amount: {
      type: Number,
      default: 0,
      min: [0, 'Tax amount cannot be negative']
    },
    rate: {
      type: Number,
      default: 0,
      min: [0, 'Tax rate cannot be negative'],
      max: [100, 'Tax rate cannot exceed 100']
    }
  },
  grossAmount: {
    type: Number,
    min: [0, 'Gross amount cannot be negative']
  },
  netAmount: {
    type: Number,
    min: [0, 'Net amount cannot be negative']
  },
  cost: {
    type: Number,
    min: [0, 'Cost cannot be negative']
  },
  profit: {
    type: Number
  },
  profitMargin: {
    type: Number
  },
  status: {
    type: String,
    enum: ['Completed', 'Pending', 'Cancelled', 'Refunded', 'Partially Refunded'],
    default: 'Completed'
  },
  region: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  refund: {
    amount: {
      type: Number,
      default: 0,
      min: [0, 'Refund amount cannot be negative']
    },
    reason: String,
    date: Date,
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    }
  }
}, {
  timestamps: true
});

// Index for better query performance
salesSchema.index({ date: -1 });
salesSchema.index({ product: 'text' });
salesSchema.index({ salesChannel: 1 });
salesSchema.index({ status: 1 });
salesSchema.index({ 'customerInfo.customerId': 1 });

// Virtual for formatted date
salesSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString();
});

// Virtual for profit percentage
salesSchema.virtual('profitPercentage').get(function() {
  if (this.amount && this.cost) {
    return ((this.amount - this.cost) / this.cost) * 100;
  }
  return 0;
});

// Pre-save middleware to calculate derived fields
salesSchema.pre('save', function(next) {
  // Calculate unit price if not provided
  if (!this.unitPrice && this.amount && this.quantity) {
    this.unitPrice = this.amount / this.quantity;
  }
  
  // Calculate gross amount
  this.grossAmount = this.quantity * (this.unitPrice || 0);
  
  // Calculate net amount after discount and tax
  const discountAmount = this.discount.amount || 0;
  const taxAmount = this.tax.amount || 0;
  this.netAmount = this.grossAmount - discountAmount + taxAmount;
  
  // Ensure amount equals net amount
  if (!this.amount) {
    this.amount = this.netAmount;
  }
  
  // Calculate profit if cost is provided
  if (this.cost) {
    this.profit = this.amount - (this.cost * this.quantity);
    this.profitMargin = this.cost > 0 ? (this.profit / (this.cost * this.quantity)) * 100 : 0;
  }
  
  next();
});

// Static method to get sales by date range
salesSchema.statics.getSalesByDateRange = function(startDate, endDate) {
  return this.find({
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  }).sort({ date: -1 });
};

// Static method to get sales by product
salesSchema.statics.getSalesByProduct = function(productName) {
  return this.find({
    product: new RegExp(productName, 'i')
  }).sort({ date: -1 });
};

// Static method to calculate total sales for a period
salesSchema.statics.getTotalSales = function(startDate, endDate) {
  const matchStage = {
    status: { $ne: 'Cancelled' }
  };
  
  if (startDate && endDate) {
    matchStage.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$amount' },
        totalQuantity: { $sum: '$quantity' },
        totalProfit: { $sum: '$profit' },
        count: { $sum: 1 }
      }
    }
  ]);
};

// Static method to get top selling products
salesSchema.statics.getTopSellingProducts = function(limit = 10) {
  return this.aggregate([
    { $match: { status: { $ne: 'Cancelled' } } },
    {
      $group: {
        _id: '$product',
        totalQuantity: { $sum: '$quantity' },
        totalAmount: { $sum: '$amount' },
        salesCount: { $sum: 1 }
      }
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: limit }
  ]);
};

// Method to calculate commission (if applicable)
salesSchema.methods.calculateCommission = function(rate = 0.05) {
  return this.amount * rate;
};

module.exports = mongoose.model('Sale', salesSchema);
