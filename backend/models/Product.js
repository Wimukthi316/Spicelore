const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true,
    maxlength: [100, 'Product name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['powder', 'whole', 'blends', 'organic', 'exotic'],
    lowercase: true
  },
  subCategory: {
    type: String,
    trim: true
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: 'Product image'
    }
  }],
  stock: {
    type: Number,
    required: [true, 'Please add stock quantity'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  threshold: {
    type: Number,
    default: 10,
    min: [0, 'Threshold cannot be negative']
  },
  unit: {
    type: String,
    enum: ['kg', 'g', 'lb', 'oz', 'piece'],
    default: 'g'
  },
  weight: {
    type: Number,
    required: [true, 'Please add product weight'],
    min: [0, 'Weight cannot be negative']
  },
  sku: {
    type: String,
    unique: true,
    required: [true, 'Please add SKU']
  },
  brand: {
    type: String,
    trim: true
  },
  origin: {
    country: String,
    region: String
  },
  nutritionalInfo: {
    calories: Number,
    protein: Number,
    carbohydrates: Number,
    fat: Number,
    fiber: Number,
    sodium: Number
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot be more than 5']
    },
    count: {
      type: Number,
      default: 0
    }
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5']
    },
    comment: {
      type: String,
      required: true,
      maxlength: [500, 'Comment cannot be more than 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  discount: {
    percentage: {
      type: Number,
      min: [0, 'Discount cannot be negative'],
      max: [100, 'Discount cannot be more than 100%']
    },
    startDate: Date,
    endDate: Date,
    isActive: {
      type: Boolean,
      default: false
    }
  },
  shelfLife: {
    value: Number,
    unit: {
      type: String,
      enum: ['days', 'months', 'years'],
      default: 'months'
    }
  },
  storageInstructions: {
    type: String,
    maxlength: [200, 'Storage instructions cannot be more than 200 characters']
  }
}, {
  timestamps: true
});

// Index for better search performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, subCategory: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'ratings.average': -1 });

// Virtual for discounted price
productSchema.virtual('discountedPrice').get(function() {
  if (this.discount && this.discount.isActive && this.discount.percentage > 0) {
    const discountAmount = (this.price * this.discount.percentage) / 100;
    return this.price - discountAmount;
  }
  return this.price;
});

// Method to check if product is in stock
productSchema.methods.isInStock = function() {
  return this.stock > 0;
};

// Method to check if stock is low
productSchema.methods.isLowStock = function() {
  return this.stock <= this.threshold;
};

// Static method to get low stock products
productSchema.statics.getLowStockProducts = function() {
  return this.find({
    $expr: { $lte: ['$stock', '$threshold'] },
    isActive: true
  });
};

module.exports = mongoose.model('Product', productSchema);
