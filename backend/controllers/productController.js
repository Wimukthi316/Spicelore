const Product = require('../models/Product');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;

  let query = { isActive: true };

  // Search functionality
  if (req.query.search) {
    query = {
      ...query,
      $or: [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { tags: { $in: [new RegExp(req.query.search, 'i')] } }
      ]
    };
  }

  // Filter by category
  if (req.query.category && req.query.category !== 'all') {
    query.category = req.query.category;
  }

  // Filter by price range
  if (req.query.minPrice || req.query.maxPrice) {
    query.price = {};
    if (req.query.minPrice) {
      query.price.$gte = parseFloat(req.query.minPrice);
    }
    if (req.query.maxPrice) {
      query.price.$lte = parseFloat(req.query.maxPrice);
    }
  }

  // Filter by rating
  if (req.query.minRating) {
    query['ratings.average'] = { $gte: parseFloat(req.query.minRating) };
  }

  // Filter by availability
  if (req.query.inStock === 'true') {
    query.stock = { $gt: 0 };
  }

  // Filter by featured
  if (req.query.featured === 'true') {
    query.isFeatured = true;
  }

  // Sorting
  let sort = {};
  if (req.query.sortBy) {
    switch (req.query.sortBy) {
      case 'price_asc':
        sort.price = 1;
        break;
      case 'price_desc':
        sort.price = -1;
        break;
      case 'rating':
        sort['ratings.average'] = -1;
        break;
      case 'newest':
        sort.createdAt = -1;
        break;
      case 'name':
        sort.name = 1;
        break;
      default:
        sort.createdAt = -1;
    }
  } else {
    sort.createdAt = -1;
  }

  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .sort(sort)
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
    count: products.length,
    total,
    pagination,
    data: products
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id)
    .populate('reviews.user', 'name avatar');

  if (!product) {
    return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Create product
// @route   POST /api/products
// @access  Admin
exports.createProduct = asyncHandler(async (req, res, next) => {
  const {
    name,
    description,
    price,
    originalPrice,
    category,
    subCategory,
    images,
    stock,
    threshold,
    unit,
    weight,
    sku,
    brand,
    origin,
    nutritionalInfo,
    tags,
    discount,
    shelfLife,
    storageInstructions
  } = req.body;

  // Check if SKU already exists
  if (sku) {
    const existingSku = await Product.findOne({ sku: sku.toUpperCase() });
    if (existingSku) {
      return next(new ErrorResponse('Product with this SKU already exists', 400));
    }
  }

  const product = await Product.create({
    name,
    description,
    price,
    originalPrice,
    category: category.toLowerCase(),
    subCategory,
    images,
    stock: stock || 0,
    threshold: threshold || 10,
    unit: unit || 'g',
    weight,
    sku: sku ? sku.toUpperCase() : undefined,
    brand,
    origin,
    nutritionalInfo,
    tags: tags ? tags.map(tag => tag.toLowerCase()) : [],
    discount,
    shelfLife,
    storageInstructions
  });

  res.status(201).json({
    success: true,
    data: product
  });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Admin
exports.updateProduct = asyncHandler(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
  }

  // Check if SKU is being updated and if it already exists
  if (req.body.sku && req.body.sku.toUpperCase() !== product.sku) {
    const existingSku = await Product.findOne({ sku: req.body.sku.toUpperCase() });
    if (existingSku) {
      return next(new ErrorResponse('Product with this SKU already exists', 400));
    }
  }

  // Fields that can be updated
  const fieldsToUpdate = {
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    originalPrice: req.body.originalPrice,
    category: req.body.category ? req.body.category.toLowerCase() : undefined,
    subCategory: req.body.subCategory,
    images: req.body.images,
    stock: req.body.stock,
    threshold: req.body.threshold,
    unit: req.body.unit,
    weight: req.body.weight,
    sku: req.body.sku ? req.body.sku.toUpperCase() : undefined,
    brand: req.body.brand,
    origin: req.body.origin,
    nutritionalInfo: req.body.nutritionalInfo,
    tags: req.body.tags ? req.body.tags.map(tag => tag.toLowerCase()) : undefined,
    isActive: req.body.isActive,
    isFeatured: req.body.isFeatured,
    discount: req.body.discount,
    shelfLife: req.body.shelfLife,
    storageInstructions: req.body.storageInstructions
  };

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(key => {
    if (fieldsToUpdate[key] === undefined) {
      delete fieldsToUpdate[key];
    }
  });

  product = await Product.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Admin
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
  }

  await Product.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully'
  });
});

// @desc    Get product statistics
// @route   GET /api/products/stats
// @access  Admin
exports.getProductStats = asyncHandler(async (req, res, next) => {
  const stats = await Product.aggregate([
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        activeProducts: {
          $sum: {
            $cond: [{ $eq: ['$isActive', true] }, 1, 0]
          }
        },
        inactiveProducts: {
          $sum: {
            $cond: [{ $eq: ['$isActive', false] }, 1, 0]
          }
        },
        featuredProducts: {
          $sum: {
            $cond: [{ $eq: ['$isFeatured', true] }, 1, 0]
          }
        },
        lowStockProducts: {
          $sum: {
            $cond: [{ $lte: ['$stock', '$threshold'] }, 1, 0]
          }
        },
        outOfStockProducts: {
          $sum: {
            $cond: [{ $eq: ['$stock', 0] }, 1, 0]
          }
        },
        averagePrice: { $avg: '$price' },
        totalStockValue: {
          $sum: { $multiply: ['$stock', '$price'] }
        }
      }
    }
  ]);

  // Get category distribution
  const categoryStats = await Product.aggregate([
    {
      $match: { isActive: true }
    },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        averagePrice: { $avg: '$price' },
        totalStock: { $sum: '$stock' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  // Get low stock products
  const lowStockProducts = await Product.getLowStockProducts();

  // Get top rated products
  const topRatedProducts = await Product.find({
    isActive: true,
    'ratings.count': { $gte: 1 }
  }).sort({ 'ratings.average': -1 }).limit(5);

  res.status(200).json({
    success: true,
    data: {
      stats: stats[0] || {
        totalProducts: 0,
        activeProducts: 0,
        inactiveProducts: 0,
        featuredProducts: 0,
        lowStockProducts: 0,
        outOfStockProducts: 0,
        averagePrice: 0,
        totalStockValue: 0
      },
      categoryStats,
      lowStockProducts: lowStockProducts.slice(0, 10),
      topRatedProducts
    }
  });
});

// @desc    Add product review
// @route   POST /api/products/:id/reviews
// @access  User
exports.addProductReview = asyncHandler(async (req, res, next) => {
  const { rating, comment } = req.body;
  const userId = req.user.id;

  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
  }

  // Check if user has already reviewed this product
  const existingReview = product.reviews.find(
    review => review.user.toString() === userId
  );

  if (existingReview) {
    return next(new ErrorResponse('Product already reviewed by this user', 400));
  }

  const review = {
    user: userId,
    name: req.user.name,
    rating: Number(rating),
    comment
  };

  product.reviews.push(review);

  // Update product rating
  product.ratings.count = product.reviews.length;
  product.ratings.average = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

  await product.save();

  res.status(201).json({
    success: true,
    message: 'Review added successfully'
  });
});

// @desc    Get product categories
// @route   GET /api/products/categories
// @access  Public
exports.getProductCategories = asyncHandler(async (req, res, next) => {
  const categories = await Product.distinct('category', { isActive: true });

  res.status(200).json({
    success: true,
    data: categories
  });
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
exports.getFeaturedProducts = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit, 10) || 8;

  const products = await Product.find({
    isActive: true,
    isFeatured: true,
    stock: { $gt: 0 }
  }).limit(limit);

  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
});

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
exports.searchProducts = asyncHandler(async (req, res, next) => {
  const { q } = req.query;
  
  if (!q) {
    return next(new ErrorResponse('Search query is required', 400));
  }

  const products = await Product.find({
    $and: [
      { isActive: true },
      {
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { tags: { $in: [new RegExp(q, 'i')] } },
          { category: { $regex: q, $options: 'i' } }
        ]
      }
    ]
  }).limit(20);

  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
});
