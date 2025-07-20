const Category = require('../models/Category');
const Product = require('../models/Product');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;

  let query = {};

  // Search functionality
  if (req.query.search) {
    query = {
      $or: [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ]
    };
  }

  // Filter by active status
  if (req.query.isActive !== undefined) {
    query.isActive = req.query.isActive === 'true';
  }

  // Filter by parent category
  if (req.query.parent) {
    query.parent = req.query.parent === 'null' ? null : req.query.parent;
  }

  // Filter by level
  if (req.query.level !== undefined) {
    query.level = parseInt(req.query.level);
  }

  const total = await Category.countDocuments(query);
  const categories = await Category.find(query)
    .populate('parent', 'name slug')
    .populate('children', 'name slug')
    .sort({ sortOrder: 1, name: 1 })
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
    count: categories.length,
    total,
    pagination,
    data: categories
  });
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
exports.getCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id)
    .populate('parent', 'name slug description')
    .populate('children', 'name slug description');

  if (!category) {
    return next(new ErrorResponse(`Category not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: category
  });
});

// @desc    Get category by slug
// @route   GET /api/categories/slug/:slug
// @access  Public
exports.getCategoryBySlug = asyncHandler(async (req, res, next) => {
  const category = await Category.findOne({ slug: req.params.slug })
    .populate('parent', 'name slug description')
    .populate('children', 'name slug description');

  if (!category) {
    return next(new ErrorResponse(`Category not found with slug of ${req.params.slug}`, 404));
  }

  res.status(200).json({
    success: true,
    data: category
  });
});

// @desc    Create category
// @route   POST /api/categories
// @access  Admin
exports.createCategory = asyncHandler(async (req, res, next) => {
  const {
    name,
    slug,
    description,
    image,
    parent,
    isActive,
    sortOrder,
    seo
  } = req.body;

  // Check if category name already exists
  const existingName = await Category.findOne({ name: name.trim() });
  if (existingName) {
    return next(new ErrorResponse('Category with this name already exists', 400));
  }

  // Check if slug already exists
  if (slug) {
    const existingSlug = await Category.findOne({ slug: slug.toLowerCase() });
    if (existingSlug) {
      return next(new ErrorResponse('Category with this slug already exists', 400));
    }
  }

  // Determine level based on parent
  let level = 0;
  if (parent) {
    const parentCategory = await Category.findById(parent);
    if (!parentCategory) {
      return next(new ErrorResponse('Parent category not found', 404));
    }
    level = parentCategory.level + 1;
  }

  const category = await Category.create({
    name: name.trim(),
    slug,
    description,
    image,
    parent: parent || null,
    level,
    isActive: isActive !== undefined ? isActive : true,
    sortOrder: sortOrder || 0,
    seo
  });

  // Update parent category's children array
  if (parent) {
    await Category.findByIdAndUpdate(parent, {
      $push: { children: category._id }
    });
  }

  res.status(201).json({
    success: true,
    data: category
  });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Admin
exports.updateCategory = asyncHandler(async (req, res, next) => {
  let category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorResponse(`Category not found with id of ${req.params.id}`, 404));
  }

  // Check if name is being updated and if it already exists
  if (req.body.name && req.body.name.trim() !== category.name) {
    const existingName = await Category.findOne({ name: req.body.name.trim() });
    if (existingName) {
      return next(new ErrorResponse('Category with this name already exists', 400));
    }
  }

  // Check if slug is being updated and if it already exists
  if (req.body.slug && req.body.slug.toLowerCase() !== category.slug) {
    const existingSlug = await Category.findOne({ slug: req.body.slug.toLowerCase() });
    if (existingSlug) {
      return next(new ErrorResponse('Category with this slug already exists', 400));
    }
  }

  // Handle parent category change
  if (req.body.parent !== undefined && req.body.parent !== category.parent?.toString()) {
    // Remove from old parent's children array
    if (category.parent) {
      await Category.findByIdAndUpdate(category.parent, {
        $pull: { children: category._id }
      });
    }

    // Add to new parent's children array and update level
    if (req.body.parent) {
      const newParent = await Category.findById(req.body.parent);
      if (!newParent) {
        return next(new ErrorResponse('Parent category not found', 404));
      }
      
      req.body.level = newParent.level + 1;
      
      await Category.findByIdAndUpdate(req.body.parent, {
        $push: { children: category._id }
      });
    } else {
      req.body.level = 0;
    }
  }

  // Fields that can be updated
  const fieldsToUpdate = {
    name: req.body.name ? req.body.name.trim() : undefined,
    slug: req.body.slug ? req.body.slug.toLowerCase() : undefined,
    description: req.body.description,
    image: req.body.image,
    parent: req.body.parent === '' ? null : req.body.parent,
    level: req.body.level,
    isActive: req.body.isActive,
    sortOrder: req.body.sortOrder,
    seo: req.body.seo
  };

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(key => {
    if (fieldsToUpdate[key] === undefined) {
      delete fieldsToUpdate[key];
    }
  });

  category = await Category.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: category
  });
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Admin
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorResponse(`Category not found with id of ${req.params.id}`, 404));
  }

  // Check if category has children
  if (category.children && category.children.length > 0) {
    return next(new ErrorResponse('Cannot delete category that has subcategories. Please delete subcategories first.', 400));
  }

  // Check if category has products
  const productCount = await Product.countDocuments({ category: category.name.toLowerCase() });
  if (productCount > 0) {
    return next(new ErrorResponse('Cannot delete category that has products. Please reassign or delete products first.', 400));
  }

  // Remove from parent's children array
  if (category.parent) {
    await Category.findByIdAndUpdate(category.parent, {
      $pull: { children: category._id }
    });
  }

  await Category.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Category deleted successfully'
  });
});

// @desc    Get category tree
// @route   GET /api/categories/tree
// @access  Public
exports.getCategoryTree = asyncHandler(async (req, res, next) => {
  const categories = await Category.find({
    isActive: true,
    parent: null
  })
  .populate({
    path: 'children',
    match: { isActive: true },
    populate: {
      path: 'children',
      match: { isActive: true }
    }
  })
  .sort({ sortOrder: 1, name: 1 });

  res.status(200).json({
    success: true,
    data: categories
  });
});

// @desc    Get main categories (parent categories only)
// @route   GET /api/categories/main
// @access  Public
exports.getMainCategories = asyncHandler(async (req, res, next) => {
  const categories = await Category.find({
    isActive: true,
    parent: null
  }).sort({ sortOrder: 1, name: 1 });

  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories
  });
});

// @desc    Get subcategories of a category
// @route   GET /api/categories/:id/subcategories
// @access  Public
exports.getSubcategories = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorResponse(`Category not found with id of ${req.params.id}`, 404));
  }

  const subcategories = await Category.find({
    parent: req.params.id,
    isActive: true
  }).sort({ sortOrder: 1, name: 1 });

  res.status(200).json({
    success: true,
    count: subcategories.length,
    data: subcategories
  });
});

// @desc    Update category product count
// @route   PUT /api/categories/:id/product-count
// @access  Admin
exports.updateCategoryProductCount = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorResponse(`Category not found with id of ${req.params.id}`, 404));
  }

  // Count products in this category
  const productCount = await Product.countDocuments({
    category: category.name.toLowerCase(),
    isActive: true
  });

  category.productCount = productCount;
  await category.save();

  res.status(200).json({
    success: true,
    data: category
  });
});

// @desc    Get category statistics
// @route   GET /api/categories/stats
// @access  Admin
exports.getCategoryStats = asyncHandler(async (req, res, next) => {
  const stats = await Category.aggregate([
    {
      $group: {
        _id: null,
        totalCategories: { $sum: 1 },
        activeCategories: {
          $sum: {
            $cond: [{ $eq: ['$isActive', true] }, 1, 0]
          }
        },
        inactiveCategories: {
          $sum: {
            $cond: [{ $eq: ['$isActive', false] }, 1, 0]
          }
        },
        mainCategories: {
          $sum: {
            $cond: [{ $eq: ['$level', 0] }, 1, 0]
          }
        },
        subcategories: {
          $sum: {
            $cond: [{ $gt: ['$level', 0] }, 1, 0]
          }
        }
      }
    }
  ]);

  // Get category distribution by level
  const levelDistribution = await Category.aggregate([
    {
      $match: { isActive: true }
    },
    {
      $group: {
        _id: '$level',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      stats: stats[0] || {
        totalCategories: 0,
        activeCategories: 0,
        inactiveCategories: 0,
        mainCategories: 0,
        subcategories: 0
      },
      levelDistribution
    }
  });
});
