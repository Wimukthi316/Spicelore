const User = require('../models/User');

class UserService {
  // Get user by email
  static async getUserByEmail(email) {
    return await User.findOne({ email }).select('+password');
  }

  // Get user by ID
  static async getUserById(id) {
    return await User.findById(id);
  }

  // Create new user
  static async createUser(userData) {
    return await User.create(userData);
  }

  // Update user
  static async updateUser(id, updateData) {
    return await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });
  }

  // Delete user
  static async deleteUser(id) {
    return await User.findByIdAndDelete(id);
  }

  // Get users with pagination and filters
  static async getUsers(filters = {}, page = 1, limit = 25) {
    const startIndex = (page - 1) * limit;
    
    let query = {};
    
    if (filters.search) {
      query = {
        $or: [
          { name: { $regex: filters.search, $options: 'i' } },
          { email: { $regex: filters.search, $options: 'i' } }
        ]
      };
    }

    if (filters.role) {
      query.role = filters.role;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex);

    return {
      users,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Get user statistics
  static async getUserStats() {
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Active'] }, 1, 0]
            }
          },
          inactiveUsers: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Inactive'] }, 1, 0]
            }
          },
          adminUsers: {
            $sum: {
              $cond: [{ $eq: ['$role', 'admin'] }, 1, 0]
            }
          },
          regularUsers: {
            $sum: {
              $cond: [{ $eq: ['$role', 'user'] }, 1, 0]
            }
          }
        }
      }
    ]);

    return stats[0] || {
      totalUsers: 0,
      activeUsers: 0,
      inactiveUsers: 0,
      adminUsers: 0,
      regularUsers: 0
    };
  }

  // Check if email exists
  static async emailExists(email, excludeId = null) {
    const query = { email };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    const user = await User.findOne(query);
    return !!user;
  }

  // Get recent users
  static async getRecentUsers(limit = 5) {
    return await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit);
  }
}

module.exports = UserService;
