const Employee = require('../models/Employee');
const bcrypt = require('bcryptjs');

class EmployeeService {
  // Create new employee
  static async createEmployee(employeeData) {
    const {
      personalInfo,
      employeeId,
      department,
      position,
      salary,
      contactInfo,
      emergencyContact,
      password
    } = employeeData;

    // Check if employee ID already exists
    const existingEmployee = await Employee.findOne({ employeeId });
    if (existingEmployee) {
      throw new Error('Employee ID already exists');
    }

    // Check if email already exists
    const existingEmail = await Employee.findOne({ 'contactInfo.email': contactInfo.email });
    if (existingEmail) {
      throw new Error('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate login credentials
    const username = `${personalInfo.firstName.toLowerCase()}.${personalInfo.lastName.toLowerCase()}`;

    const employee = new Employee({
      personalInfo,
      employeeId,
      department,
      position,
      salary,
      contactInfo,
      emergencyContact,
      loginCredentials: {
        username,
        password: hashedPassword
      },
      employment: {
        startDate: new Date(),
        status: 'active',
        type: employeeData.employmentType || 'full-time'
      }
    });

    return await employee.save();
  }

  // Get employee by ID
  static async getEmployeeById(id) {
    return await Employee.findById(id).select('-loginCredentials.password');
  }

  // Get employee by employee ID
  static async getEmployeeByEmployeeId(employeeId) {
    return await Employee.findOne({ employeeId }).select('-loginCredentials.password');
  }

  // Get employees with filters and pagination
  static async getEmployees(filters = {}, page = 1, limit = 25) {
    const startIndex = (page - 1) * limit;
    
    let query = {};

    // Filter by department
    if (filters.department && filters.department !== 'all') {
      query.department = filters.department;
    }

    // Filter by position
    if (filters.position && filters.position !== 'all') {
      query.position = filters.position;
    }

    // Filter by employment status
    if (filters.status && filters.status !== 'all') {
      query['employment.status'] = filters.status;
    }

    // Filter by employment type
    if (filters.employmentType && filters.employmentType !== 'all') {
      query['employment.type'] = filters.employmentType;
    }

    // Search functionality
    if (filters.search) {
      query.$or = [
        { 'personalInfo.firstName': { $regex: filters.search, $options: 'i' } },
        { 'personalInfo.lastName': { $regex: filters.search, $options: 'i' } },
        { employeeId: { $regex: filters.search, $options: 'i' } },
        { 'contactInfo.email': { $regex: filters.search, $options: 'i' } },
        { department: { $regex: filters.search, $options: 'i' } },
        { position: { $regex: filters.search, $options: 'i' } }
      ];
    }

    // Date range filter for hire date
    if (filters.startDate || filters.endDate) {
      query['employment.startDate'] = {};
      if (filters.startDate) {
        query['employment.startDate'].$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query['employment.startDate'].$lte = new Date(filters.endDate);
      }
    }

    // Sorting
    let sort = {};
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'name_asc':
          sort['personalInfo.lastName'] = 1;
          break;
        case 'name_desc':
          sort['personalInfo.lastName'] = -1;
          break;
        case 'department':
          sort.department = 1;
          break;
        case 'position':
          sort.position = 1;
          break;
        case 'hire_date_desc':
          sort['employment.startDate'] = -1;
          break;
        case 'hire_date_asc':
          sort['employment.startDate'] = 1;
          break;
        case 'salary_desc':
          sort['salary.amount'] = -1;
          break;
        case 'salary_asc':
          sort['salary.amount'] = 1;
          break;
        default:
          sort['employment.startDate'] = -1;
      }
    } else {
      sort['employment.startDate'] = -1;
    }

    const total = await Employee.countDocuments(query);
    const employees = await Employee.find(query)
      .select('-loginCredentials.password')
      .sort(sort)
      .limit(limit)
      .skip(startIndex);

    return {
      employees,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Update employee
  static async updateEmployee(id, updateData) {
    const employee = await Employee.findById(id);
    if (!employee) {
      throw new Error('Employee not found');
    }

    // Check if employee ID is being updated and if it already exists
    if (updateData.employeeId && updateData.employeeId !== employee.employeeId) {
      const existingEmployee = await Employee.findOne({ employeeId: updateData.employeeId });
      if (existingEmployee) {
        throw new Error('Employee ID already exists');
      }
    }

    // Check if email is being updated and if it already exists
    if (updateData.contactInfo?.email && updateData.contactInfo.email !== employee.contactInfo.email) {
      const existingEmail = await Employee.findOne({ 'contactInfo.email': updateData.contactInfo.email });
      if (existingEmail) {
        throw new Error('Email already registered');
      }
    }

    // If password is being updated, hash it
    if (updateData.password) {
      updateData['loginCredentials.password'] = await bcrypt.hash(updateData.password, 12);
      delete updateData.password;
    }

    return await Employee.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    }).select('-loginCredentials.password');
  }

  // Delete employee
  static async deleteEmployee(id) {
    const employee = await Employee.findById(id);
    if (!employee) {
      throw new Error('Employee not found');
    }

    // Instead of deleting, mark as terminated
    return await Employee.findByIdAndUpdate(id, {
      'employment.status': 'terminated',
      'employment.endDate': new Date()
    }, { new: true }).select('-loginCredentials.password');
  }

  // Authenticate employee
  static async authenticateEmployee(username, password) {
    const employee = await Employee.findOne({
      'loginCredentials.username': username,
      'employment.status': 'active'
    });

    if (!employee) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, employee.loginCredentials.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    employee.loginCredentials.lastLogin = new Date();
    await employee.save();

    return employee.toObject({ getters: true, transform: (doc, ret) => {
      delete ret.loginCredentials.password;
      return ret;
    }});
  }

  // Get employee statistics
  static async getEmployeeStats() {
    const stats = await Employee.aggregate([
      {
        $group: {
          _id: null,
          totalEmployees: { $sum: 1 },
          activeEmployees: {
            $sum: {
              $cond: [{ $eq: ['$employment.status', 'active'] }, 1, 0]
            }
          },
          inactiveEmployees: {
            $sum: {
              $cond: [{ $eq: ['$employment.status', 'inactive'] }, 1, 0]
            }
          },
          terminatedEmployees: {
            $sum: {
              $cond: [{ $eq: ['$employment.status', 'terminated'] }, 1, 0]
            }
          },
          averageSalary: { $avg: '$salary.amount' },
          totalSalaryExpense: { $sum: '$salary.amount' }
        }
      }
    ]);

    // Get department breakdown
    const departmentStats = await Employee.aggregate([
      { $match: { 'employment.status': 'active' } },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
          averageSalary: { $avg: '$salary.amount' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get position breakdown
    const positionStats = await Employee.aggregate([
      { $match: { 'employment.status': 'active' } },
      {
        $group: {
          _id: '$position',
          count: { $sum: 1 },
          averageSalary: { $avg: '$salary.amount' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    return {
      overview: stats[0] || {
        totalEmployees: 0,
        activeEmployees: 0,
        inactiveEmployees: 0,
        terminatedEmployees: 0,
        averageSalary: 0,
        totalSalaryExpense: 0
      },
      departmentBreakdown: departmentStats,
      positionBreakdown: positionStats
    };
  }

  // Add performance review
  static async addPerformanceReview(employeeId, reviewData) {
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    const review = {
      reviewDate: reviewData.reviewDate || new Date(),
      reviewPeriod: reviewData.reviewPeriod,
      reviewer: reviewData.reviewer,
      overallRating: reviewData.overallRating,
      goals: reviewData.goals || [],
      achievements: reviewData.achievements || [],
      areasForImprovement: reviewData.areasForImprovement || [],
      comments: reviewData.comments,
      nextReviewDate: reviewData.nextReviewDate
    };

    employee.performance.reviews.push(review);
    employee.performance.lastReviewDate = review.reviewDate;
    employee.performance.currentRating = review.overallRating;

    return await employee.save();
  }

  // Update employee salary
  static async updateSalary(employeeId, newSalary, effectiveDate = new Date()) {
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    // Add to salary history
    employee.salary.history.push({
      amount: employee.salary.amount,
      effectiveDate: employee.salary.effectiveDate || employee.employment.startDate,
      reason: 'Previous salary record'
    });

    // Update current salary
    employee.salary.amount = newSalary;
    employee.salary.effectiveDate = effectiveDate;

    return await employee.save();
  }

  // Get employees by department
  static async getEmployeesByDepartment(department) {
    return await Employee.find({
      department: department,
      'employment.status': 'active'
    }).select('-loginCredentials.password');
  }

  // Get upcoming performance reviews
  static async getUpcomingReviews(daysAhead = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return await Employee.find({
      'employment.status': 'active',
      'performance.nextReviewDate': { $lte: futureDate }
    }).select('personalInfo employeeId department position performance.nextReviewDate');
  }

  // Search employees
  static async searchEmployees(searchTerm, limit = 20) {
    return await Employee.find({
      $and: [
        { 'employment.status': 'active' },
        {
          $or: [
            { 'personalInfo.firstName': { $regex: searchTerm, $options: 'i' } },
            { 'personalInfo.lastName': { $regex: searchTerm, $options: 'i' } },
            { employeeId: { $regex: searchTerm, $options: 'i' } },
            { department: { $regex: searchTerm, $options: 'i' } },
            { position: { $regex: searchTerm, $options: 'i' } }
          ]
        }
      ]
    })
    .select('-loginCredentials.password')
    .limit(limit);
  }
}

module.exports = EmployeeService;
