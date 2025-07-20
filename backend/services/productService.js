const Product = require('../models/Product');

class ProductService {
  // Get products with filters and pagination
  static async getProducts(filters = {}, page = 1, limit = 25) {
    const startIndex = (page - 1) * limit;
    
    let query = { isActive: true };

    // Search functionality
    if (filters.search) {
      query = {
        ...query,
        $or: [
          { name: { $regex: filters.search, $options: 'i' } },
          { description: { $regex: filters.search, $options: 'i' } },
          { tags: { $in: [new RegExp(filters.search, 'i')] } }
        ]
      };
    }

    // Category filter
    if (filters.category && filters.category !== 'all') {
      query.category = filters.category;
    }

    // Price range filter
    if (filters.minPrice || filters.maxPrice) {
      query.price = {};
      if (filters.minPrice) {
        query.price.$gte = parseFloat(filters.minPrice);
      }
      if (filters.maxPrice) {
        query.price.$lte = parseFloat(filters.maxPrice);
      }
    }

    // Rating filter
    if (filters.minRating) {
      query['ratings.average'] = { $gte: parseFloat(filters.minRating) };
    }

    // Availability filter
    if (filters.inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    // Featured filter
    if (filters.featured === 'true') {
      query.isFeatured = true;
    }

    // Sorting
    let sort = {};
    if (filters.sortBy) {
      switch (filters.sortBy) {
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

    return {
      products,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Get product by ID
  static async getProductById(id) {
    return await Product.findById(id).populate('reviews.user', 'name avatar');
  }

  // Create new product
  static async createProduct(productData) {
    // Check if SKU already exists
    if (productData.sku) {
      const existingSku = await Product.findOne({ sku: productData.sku.toUpperCase() });
      if (existingSku) {
        throw new Error('Product with this SKU already exists');
      }
    }

    return await Product.create({
      ...productData,
      sku: productData.sku ? productData.sku.toUpperCase() : undefined,
      category: productData.category.toLowerCase(),
      tags: productData.tags ? productData.tags.map(tag => tag.toLowerCase()) : []
    });
  }

  // Update product
  static async updateProduct(id, updateData) {
    const product = await Product.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }

    // Check if SKU is being updated and if it already exists
    if (updateData.sku && updateData.sku.toUpperCase() !== product.sku) {
      const existingSku = await Product.findOne({ sku: updateData.sku.toUpperCase() });
      if (existingSku) {
        throw new Error('Product with this SKU already exists');
      }
    }

    const fieldsToUpdate = {
      ...updateData,
      sku: updateData.sku ? updateData.sku.toUpperCase() : undefined,
      category: updateData.category ? updateData.category.toLowerCase() : undefined,
      tags: updateData.tags ? updateData.tags.map(tag => tag.toLowerCase()) : undefined
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => {
      if (fieldsToUpdate[key] === undefined) {
        delete fieldsToUpdate[key];
      }
    });

    return await Product.findByIdAndUpdate(id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });
  }

  // Delete product
  static async deleteProduct(id) {
    return await Product.findByIdAndDelete(id);
  }

  // Get featured products
  static async getFeaturedProducts(limit = 8) {
    return await Product.find({
      isActive: true,
      isFeatured: true,
      stock: { $gt: 0 }
    }).limit(limit);
  }

  // Search products
  static async searchProducts(searchTerm, limit = 20) {
    return await Product.find({
      $and: [
        { isActive: true },
        {
          $or: [
            { name: { $regex: searchTerm, $options: 'i' } },
            { description: { $regex: searchTerm, $options: 'i' } },
            { tags: { $in: [new RegExp(searchTerm, 'i')] } },
            { category: { $regex: searchTerm, $options: 'i' } }
          ]
        }
      ]
    }).limit(limit);
  }

  // Get product categories
  static async getProductCategories() {
    return await Product.distinct('category', { isActive: true });
  }

  // Get low stock products
  static async getLowStockProducts() {
    return await Product.getLowStockProducts();
  }

  // Add product review
  static async addProductReview(productId, userId, userName, rating, comment) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    // Check if user has already reviewed this product
    const existingReview = product.reviews.find(
      review => review.user.toString() === userId
    );

    if (existingReview) {
      throw new Error('Product already reviewed by this user');
    }

    const review = {
      user: userId,
      name: userName,
      rating: Number(rating),
      comment
    };

    product.reviews.push(review);

    // Update product rating
    product.ratings.count = product.reviews.length;
    product.ratings.average = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

    await product.save();
    return product;
  }

  // Get product statistics
  static async getProductStats() {
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

    return stats[0] || {
      totalProducts: 0,
      activeProducts: 0,
      inactiveProducts: 0,
      featuredProducts: 0,
      lowStockProducts: 0,
      outOfStockProducts: 0,
      averagePrice: 0,
      totalStockValue: 0
    };
  }

  // Update product stock
  static async updateProductStock(productId, quantity, operation = 'decrease') {
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    let newStock;
    if (operation === 'decrease') {
      newStock = Math.max(0, product.stock - quantity);
    } else {
      newStock = product.stock + quantity;
    }

    return await Product.findByIdAndUpdate(
      productId,
      { stock: newStock },
      { new: true }
    );
  }
}

module.exports = ProductService;
