const Category = require('../models/Category');

class CategoryService {
  // Create new category
  static async createCategory(categoryData) {
    const { name, description, parentCategory, isActive, seoData } = categoryData;

    // Check if category name already exists at the same level
    let existingCategory;
    if (parentCategory) {
      existingCategory = await Category.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        parentCategory
      });
    } else {
      existingCategory = await Category.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        parentCategory: { $exists: false }
      });
    }

    if (existingCategory) {
      throw new Error('Category with this name already exists at this level');
    }

    // Generate slug from name if not provided
    const slug = seoData?.slug || name.toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');

    // Check if slug already exists
    const existingSlug = await Category.findOne({ 'seoData.slug': slug });
    if (existingSlug) {
      throw new Error('Category slug already exists');
    }

    const category = new Category({
      name,
      description,
      parentCategory,
      isActive: isActive !== false, // Default to true
      seoData: {
        slug,
        metaTitle: seoData?.metaTitle || name,
        metaDescription: seoData?.metaDescription || description || `Shop ${name} products`,
        keywords: seoData?.keywords || [name.toLowerCase()]
      }
    });

    const savedCategory = await category.save();

    // Update parent category's subcategories if this is a subcategory
    if (parentCategory) {
      await Category.findByIdAndUpdate(
        parentCategory,
        { $addToSet: { subcategories: savedCategory._id } }
      );
    }

    return savedCategory;
  }

  // Get category by ID
  static async getCategoryById(id) {
    return await Category.findById(id)
      .populate('parentCategory', 'name slug')
      .populate('subcategories', 'name slug isActive');
  }

  // Get category by slug
  static async getCategoryBySlug(slug) {
    return await Category.findOne({ 'seoData.slug': slug })
      .populate('parentCategory', 'name slug')
      .populate('subcategories', 'name slug isActive');
  }

  // Get categories with filters and pagination
  static async getCategories(filters = {}, page = 1, limit = 25) {
    const startIndex = (page - 1) * limit;
    
    let query = {};

    // Filter by active status
    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive === 'true';
    }

    // Filter by parent category
    if (filters.parentCategory) {
      if (filters.parentCategory === 'null') {
        query.parentCategory = { $exists: false };
      } else {
        query.parentCategory = filters.parentCategory;
      }
    }

    // Search functionality
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
        { 'seoData.keywords': { $in: [new RegExp(filters.search, 'i')] } }
      ];
    }

    // Sorting
    let sort = {};
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'name_asc':
          sort.name = 1;
          break;
        case 'name_desc':
          sort.name = -1;
          break;
        case 'created_desc':
          sort.createdAt = -1;
          break;
        case 'created_asc':
          sort.createdAt = 1;
          break;
        case 'updated_desc':
          sort.updatedAt = -1;
          break;
        default:
          sort.name = 1;
      }
    } else {
      sort.name = 1;
    }

    const total = await Category.countDocuments(query);
    const categories = await Category.find(query)
      .populate('parentCategory', 'name slug')
      .populate('subcategories', 'name slug isActive')
      .sort(sort)
      .limit(limit)
      .skip(startIndex);

    return {
      categories,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Get all active categories (for frontend dropdowns, etc.)
  static async getActiveCategories() {
    return await Category.find({ isActive: true })
      .populate('subcategories', 'name slug isActive')
      .sort({ name: 1 });
  }

  // Get category tree (hierarchical structure)
  static async getCategoryTree() {
    // Get all root categories (no parent)
    const rootCategories = await Category.find({
      parentCategory: { $exists: false },
      isActive: true
    })
    .populate({
      path: 'subcategories',
      match: { isActive: true },
      populate: {
        path: 'subcategories',
        match: { isActive: true }
      }
    })
    .sort({ name: 1 });

    return rootCategories;
  }

  // Update category
  static async updateCategory(id, updateData) {
    const category = await Category.findById(id);
    if (!category) {
      throw new Error('Category not found');
    }

    // Check if name is being updated and if it conflicts
    if (updateData.name && updateData.name !== category.name) {
      let existingCategory;
      if (category.parentCategory) {
        existingCategory = await Category.findOne({
          name: { $regex: new RegExp(`^${updateData.name}$`, 'i') },
          parentCategory: category.parentCategory,
          _id: { $ne: id }
        });
      } else {
        existingCategory = await Category.findOne({
          name: { $regex: new RegExp(`^${updateData.name}$`, 'i') },
          parentCategory: { $exists: false },
          _id: { $ne: id }
        });
      }

      if (existingCategory) {
        throw new Error('Category with this name already exists at this level');
      }
    }

    // Generate new slug if name is being updated
    if (updateData.name && !updateData.seoData?.slug) {
      const newSlug = updateData.name.toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');

      // Check if new slug conflicts
      const existingSlug = await Category.findOne({
        'seoData.slug': newSlug,
        _id: { $ne: id }
      });

      if (existingSlug) {
        throw new Error('Category slug would conflict with existing category');
      }

      updateData.seoData = {
        ...updateData.seoData,
        slug: newSlug
      };
    }

    // Check if slug is being updated directly
    if (updateData.seoData?.slug && updateData.seoData.slug !== category.seoData.slug) {
      const existingSlug = await Category.findOne({
        'seoData.slug': updateData.seoData.slug,
        _id: { $ne: id }
      });

      if (existingSlug) {
        throw new Error('Category slug already exists');
      }
    }

    // Handle parent category changes
    if (updateData.parentCategory !== undefined) {
      // Remove from old parent's subcategories
      if (category.parentCategory) {
        await Category.findByIdAndUpdate(
          category.parentCategory,
          { $pull: { subcategories: id } }
        );
      }

      // Add to new parent's subcategories
      if (updateData.parentCategory) {
        // Prevent circular references
        if (updateData.parentCategory === id) {
          throw new Error('Category cannot be its own parent');
        }

        // Check if new parent is a descendant
        const isDescendant = await this.isDescendant(id, updateData.parentCategory);
        if (isDescendant) {
          throw new Error('Cannot move category under its own descendant');
        }

        await Category.findByIdAndUpdate(
          updateData.parentCategory,
          { $addToSet: { subcategories: id } }
        );
      }
    }

    return await Category.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    })
    .populate('parentCategory', 'name slug')
    .populate('subcategories', 'name slug isActive');
  }

  // Delete category
  static async deleteCategory(id) {
    const category = await Category.findById(id);
    if (!category) {
      throw new Error('Category not found');
    }

    // Check if category has subcategories
    if (category.subcategories && category.subcategories.length > 0) {
      throw new Error('Cannot delete category with subcategories. Delete or move subcategories first.');
    }

    // Check if category has products (you'd need to import Product model for this)
    // For now, we'll just comment this out as it would create circular dependency
    // const productsInCategory = await Product.countDocuments({ category: id });
    // if (productsInCategory > 0) {
    //   throw new Error('Cannot delete category with products. Move or delete products first.');
    // }

    // Remove from parent's subcategories
    if (category.parentCategory) {
      await Category.findByIdAndUpdate(
        category.parentCategory,
        { $pull: { subcategories: id } }
      );
    }

    return await Category.findByIdAndDelete(id);
  }

  // Check if category is descendant of another category
  static async isDescendant(categoryId, potentialAncestorId) {
    const category = await Category.findById(categoryId);
    if (!category || !category.parentCategory) {
      return false;
    }

    if (category.parentCategory.toString() === potentialAncestorId) {
      return true;
    }

    return await this.isDescendant(category.parentCategory, potentialAncestorId);
  }

  // Get category statistics
  static async getCategoryStats() {
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
          rootCategories: {
            $sum: {
              $cond: [{ $not: { $ifNull: ['$parentCategory', false] } }, 0, 1]
            }
          },
          subcategories: {
            $sum: {
              $cond: [{ $ifNull: ['$parentCategory', false] }, 1, 0]
            }
          }
        }
      }
    ]);

    // Get categories by depth
    const depthStats = await Category.aggregate([
      {
        $lookup: {
          from: 'categories',
          localField: 'parentCategory',
          foreignField: '_id',
          as: 'parent'
        }
      },
      {
        $addFields: {
          depth: {
            $cond: [
              { $eq: [{ $size: '$parent' }, 0] },
              0,
              1
            ]
          }
        }
      },
      {
        $group: {
          _id: '$depth',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return {
      overview: stats[0] || {
        totalCategories: 0,
        activeCategories: 0,
        inactiveCategories: 0,
        rootCategories: 0,
        subcategories: 0
      },
      depthBreakdown: depthStats
    };
  }

  // Search categories
  static async searchCategories(searchTerm, limit = 20) {
    return await Category.find({
      $and: [
        { isActive: true },
        {
          $or: [
            { name: { $regex: searchTerm, $options: 'i' } },
            { description: { $regex: searchTerm, $options: 'i' } },
            { 'seoData.keywords': { $in: [new RegExp(searchTerm, 'i')] } }
          ]
        }
      ]
    })
    .select('name description slug parentCategory')
    .populate('parentCategory', 'name slug')
    .limit(limit)
    .sort({ name: 1 });
  }

  // Get categories with product counts
  static async getCategoriesWithProductCounts() {
    // This would require Product model import, so we'll return a placeholder
    // In a real implementation, you'd aggregate with products
    const categories = await Category.find({ isActive: true })
      .populate('subcategories', 'name slug isActive')
      .sort({ name: 1 });

    // For now, return categories with 0 product counts
    // In real implementation, you'd use aggregation to count products
    return categories.map(category => ({
      ...category.toObject(),
      productCount: 0 // This would be calculated from Product collection
    }));
  }

  // Bulk import categories
  static async bulkImportCategories(categoriesData) {
    const results = {
      success: [],
      errors: []
    };

    for (const [index, data] of categoriesData.entries()) {
      try {
        const category = await this.createCategory(data);
        results.success.push({
          index,
          category: category._id,
          name: category.name,
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

  // Get breadcrumb for category
  static async getCategoryBreadcrumb(categoryId) {
    const breadcrumb = [];
    let currentCategory = await Category.findById(categoryId)
      .populate('parentCategory', 'name slug');

    while (currentCategory) {
      breadcrumb.unshift({
        id: currentCategory._id,
        name: currentCategory.name,
        slug: currentCategory.seoData.slug
      });

      if (currentCategory.parentCategory) {
        currentCategory = await Category.findById(currentCategory.parentCategory._id)
          .populate('parentCategory', 'name slug');
      } else {
        currentCategory = null;
      }
    }

    return breadcrumb;
  }
}

module.exports = CategoryService;
