const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot be more than 100 characters']
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    uppercase: true
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  threshold: {
    type: Number,
    required: [true, 'Threshold is required'],
    min: [0, 'Threshold cannot be negative'],
    default: 10
  },
  unit: {
    type: String,
    enum: ['kg', 'g', 'lb', 'oz', 'piece', 'packet', 'box'],
    default: 'g'
  },
  costPrice: {
    type: Number,
    min: [0, 'Cost price cannot be negative']
  },
  sellingPrice: {
    type: Number,
    min: [0, 'Selling price cannot be negative']
  },
  supplier: {
    name: String,
    contact: String,
    email: String,
    address: String
  },
  location: {
    warehouse: {
      type: String,
      default: 'Main Warehouse'
    },
    section: String,
    shelf: String,
    bin: String
  },
  batchInfo: [{
    batchNumber: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, 'Batch quantity cannot be negative']
    },
    expiryDate: Date,
    manufactureDate: Date,
    supplier: String,
    costPrice: Number,
    notes: String,
    status: {
      type: String,
      enum: ['Active', 'Expired', 'Recalled', 'Damaged'],
      default: 'Active'
    }
  }],
  movements: [{
    type: {
      type: String,
      enum: ['IN', 'OUT', 'ADJUSTMENT', 'TRANSFER', 'RETURN'],
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    previousStock: {
      type: Number,
      required: true
    },
    newStock: {
      type: Number,
      required: true
    },
    reason: {
      type: String,
      required: true,
      maxlength: [200, 'Reason cannot be more than 200 characters']
    },
    reference: {
      type: String, // Order ID, Transfer ID, etc.
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    },
    date: {
      type: Date,
      default: Date.now
    },
    notes: String
  }],
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Discontinued'],
    default: 'Active'
  },
  reorderPoint: {
    type: Number,
    min: [0, 'Reorder point cannot be negative']
  },
  maxStock: {
    type: Number,
    min: [0, 'Maximum stock cannot be negative']
  },
  storageConditions: {
    temperature: {
      min: Number,
      max: Number,
      unit: {
        type: String,
        enum: ['C', 'F'],
        default: 'C'
      }
    },
    humidity: {
      min: Number,
      max: Number
    },
    lightCondition: {
      type: String,
      enum: ['Dark', 'Low Light', 'Normal Light', 'Bright Light']
    },
    specialInstructions: String
  },
  lastStockCheck: {
    date: Date,
    checkedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    },
    physicalCount: Number,
    systemCount: Number,
    variance: Number,
    notes: String
  }
}, {
  timestamps: true
});

// Index for better query performance
inventorySchema.index({ name: 'text', sku: 'text' });
inventorySchema.index({ stock: 1 });
inventorySchema.index({ threshold: 1 });
inventorySchema.index({ status: 1 });

// Virtual to check if item is low stock
inventorySchema.virtual('isLowStock').get(function() {
  return this.stock <= this.threshold;
});

// Virtual to check if item is out of stock
inventorySchema.virtual('isOutOfStock').get(function() {
  return this.stock === 0;
});

// Virtual to calculate stock value
inventorySchema.virtual('stockValue').get(function() {
  return this.stock * (this.costPrice || 0);
});

// Virtual to calculate profit margin
inventorySchema.virtual('profitMargin').get(function() {
  if (this.costPrice && this.sellingPrice) {
    return ((this.sellingPrice - this.costPrice) / this.costPrice) * 100;
  }
  return 0;
});

// Method to add stock movement
inventorySchema.methods.addMovement = function(type, quantity, reason, reference, performedBy, notes = '') {
  const previousStock = this.stock;
  
  if (type === 'IN' || type === 'RETURN') {
    this.stock += quantity;
  } else if (type === 'OUT' || type === 'TRANSFER') {
    this.stock = Math.max(0, this.stock - quantity);
  } else if (type === 'ADJUSTMENT') {
    this.stock = Math.max(0, quantity); // Set to exact quantity for adjustments
  }
  
  this.movements.push({
    type,
    quantity: Math.abs(quantity),
    previousStock,
    newStock: this.stock,
    reason,
    reference,
    performedBy,
    notes
  });
  
  return this.save();
};

// Method to check stock status
inventorySchema.methods.getStockStatus = function() {
  if (this.stock === 0) return 'Out of Stock';
  if (this.stock <= this.threshold) return 'Low Stock';
  if (this.maxStock && this.stock >= this.maxStock) return 'Overstock';
  return 'In Stock';
};

// Static method to get low stock items
inventorySchema.statics.getLowStockItems = function() {
  return this.find({
    $expr: { $lte: ['$stock', '$threshold'] },
    status: 'Active'
  });
};

// Static method to get out of stock items
inventorySchema.statics.getOutOfStockItems = function() {
  return this.find({
    stock: 0,
    status: 'Active'
  });
};

// Pre-save middleware to generate SKU if not provided
inventorySchema.pre('save', async function(next) {
  if (!this.sku && this.name) {
    const namePrefix = this.name.substring(0, 3).toUpperCase();
    const count = await this.constructor.countDocuments();
    this.sku = `${namePrefix}${String(count + 1).padStart(4, '0')}`;
  }
  
  // Set reorder point if not provided
  if (!this.reorderPoint) {
    this.reorderPoint = this.threshold * 2;
  }
  
  next();
});

module.exports = mongoose.model('Inventory', inventorySchema);
