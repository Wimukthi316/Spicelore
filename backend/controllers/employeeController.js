const Employee = require('../models/Employee');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all employees
// @route   GET /api/employees
// @access  Admin
exports.getEmployees = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;

  let query = {};

  // Search functionality
  if (req.query.search) {
    query = {
      $or: [
        { name: { $regex: req.query.search, $options: 'i' } },
        { empid: { $regex: req.query.search, $options: 'i' } },
        { role: { $regex: req.query.search, $options: 'i' } },
        { contact: { $regex: req.query.search, $options: 'i' } }
      ]
    };
  }

  // Filter by department
  if (req.query.department) {
    query.department = req.query.department;
  }

  // Filter by status
  if (req.query.status) {
    query.status = req.query.status;
  }

  // Filter by role
  if (req.query.role) {
    query.role = req.query.role;
  }

  const total = await Employee.countDocuments(query);
  const employees = await Employee.find(query)
    .populate('manager', 'name empid')
    .sort({ createdAt: -1 })
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
    count: employees.length,
    total,
    pagination,
    data: employees
  });
});

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Admin
exports.getEmployee = asyncHandler(async (req, res, next) => {
  const employee = await Employee.findById(req.params.id)
    .populate('manager', 'name empid role');

  if (!employee) {
    return next(new ErrorResponse(`Employee not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: employee
  });
});

// @desc    Create employee
// @route   POST /api/employees
// @access  Admin
exports.createEmployee = asyncHandler(async (req, res, next) => {
  const {
    name,
    empid,
    role,
    contact,
    department,
    salary,
    hireDate,
    status,
    address,
    emergencyContact,
    skills,
    workSchedule,
    manager
  } = req.body;

  // Check if employee ID already exists
  if (empid) {
    const existingEmployee = await Employee.findOne({ empid: empid.toUpperCase() });
    if (existingEmployee) {
      return next(new ErrorResponse('Employee with this ID already exists', 400));
    }
  }

  // Check if contact already exists
  const existingContact = await Employee.findOne({ contact });
  if (existingContact) {
    return next(new ErrorResponse('Employee with this contact information already exists', 400));
  }

  const employee = await Employee.create({
    name,
    empid: empid ? empid.toUpperCase() : undefined,
    role,
    contact,
    department,
    salary,
    hireDate: hireDate || Date.now(),
    status: status || 'Active',
    address,
    emergencyContact,
    skills,
    workSchedule: workSchedule || 'Full-time',
    manager
  });

  res.status(201).json({
    success: true,
    data: employee
  });
});

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Admin
exports.updateEmployee = asyncHandler(async (req, res, next) => {
  let employee = await Employee.findById(req.params.id);

  if (!employee) {
    return next(new ErrorResponse(`Employee not found with id of ${req.params.id}`, 404));
  }

  // Check if employee ID is being updated and if it already exists
  if (req.body.empid && req.body.empid.toUpperCase() !== employee.empid) {
    const existingEmployee = await Employee.findOne({ empid: req.body.empid.toUpperCase() });
    if (existingEmployee) {
      return next(new ErrorResponse('Employee with this ID already exists', 400));
    }
  }

  // Check if contact is being updated and if it already exists
  if (req.body.contact && req.body.contact !== employee.contact) {
    const existingContact = await Employee.findOne({ contact: req.body.contact });
    if (existingContact) {
      return next(new ErrorResponse('Employee with this contact information already exists', 400));
    }
  }

  // Fields that can be updated
  const fieldsToUpdate = {
    name: req.body.name,
    empid: req.body.empid ? req.body.empid.toUpperCase() : undefined,
    role: req.body.role,
    contact: req.body.contact,
    department: req.body.department,
    salary: req.body.salary,
    status: req.body.status,
    address: req.body.address,
    emergencyContact: req.body.emergencyContact,
    skills: req.body.skills,
    workSchedule: req.body.workSchedule,
    manager: req.body.manager,
    performance: req.body.performance
  };

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(key => {
    if (fieldsToUpdate[key] === undefined) {
      delete fieldsToUpdate[key];
    }
  });

  employee = await Employee.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: employee
  });
});

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Admin
exports.deleteEmployee = asyncHandler(async (req, res, next) => {
  const employee = await Employee.findById(req.params.id);

  if (!employee) {
    return next(new ErrorResponse(`Employee not found with id of ${req.params.id}`, 404));
  }

  // Check if employee is a manager of other employees
  const subordinates = await Employee.find({ manager: req.params.id });
  if (subordinates.length > 0) {
    return next(new ErrorResponse('Cannot delete employee who is managing other employees. Please reassign subordinates first.', 400));
  }

  await Employee.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Employee deleted successfully'
  });
});

// @desc    Get employee statistics
// @route   GET /api/employees/stats
// @access  Admin
exports.getEmployeeStats = asyncHandler(async (req, res, next) => {
  const stats = await Employee.aggregate([
    {
      $group: {
        _id: null,
        totalEmployees: { $sum: 1 },
        activeEmployees: {
          $sum: {
            $cond: [{ $eq: ['$status', 'Active'] }, 1, 0]
          }
        },
        inactiveEmployees: {
          $sum: {
            $cond: [{ $eq: ['$status', 'Inactive'] }, 1, 0]
          }
        },
        onLeaveEmployees: {
          $sum: {
            $cond: [{ $eq: ['$status', 'On Leave'] }, 1, 0]
          }
        },
        fullTimeEmployees: {
          $sum: {
            $cond: [{ $eq: ['$workSchedule', 'Full-time'] }, 1, 0]
          }
        },
        partTimeEmployees: {
          $sum: {
            $cond: [{ $eq: ['$workSchedule', 'Part-time'] }, 1, 0]
          }
        },
        averageSalary: { $avg: '$salary' },
        totalSalaryExpense: { $sum: '$salary' }
      }
    }
  ]);

  // Get department-wise employee count
  const departmentStats = await Employee.aggregate([
    {
      $match: { status: 'Active' }
    },
    {
      $group: {
        _id: '$department',
        count: { $sum: 1 },
        averageSalary: { $avg: '$salary' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  // Get recent hires
  const recentHires = await Employee.find({ status: 'Active' })
    .sort({ hireDate: -1 })
    .limit(5)
    .select('name empid role department hireDate');

  res.status(200).json({
    success: true,
    data: {
      stats: stats[0] || {
        totalEmployees: 0,
        activeEmployees: 0,
        inactiveEmployees: 0,
        onLeaveEmployees: 0,
        fullTimeEmployees: 0,
        partTimeEmployees: 0,
        averageSalary: 0,
        totalSalaryExpense: 0
      },
      departmentStats,
      recentHires
    }
  });
});

// @desc    Get employees by department
// @route   GET /api/employees/department/:dept
// @access  Admin
exports.getEmployeesByDepartment = asyncHandler(async (req, res, next) => {
  const department = req.params.dept;
  
  const employees = await Employee.find({ 
    department: department,
    status: 'Active'
  }).select('name empid role contact');

  res.status(200).json({
    success: true,
    count: employees.length,
    data: employees
  });
});

// @desc    Update employee status
// @route   PUT /api/employees/:id/status
// @access  Admin
exports.updateEmployeeStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  if (!status) {
    return next(new ErrorResponse('Status is required', 400));
  }

  const employee = await Employee.findById(req.params.id);

  if (!employee) {
    return next(new ErrorResponse(`Employee not found with id of ${req.params.id}`, 404));
  }

  employee.status = status;
  await employee.save();

  res.status(200).json({
    success: true,
    data: employee
  });
});

// @desc    Add employee performance review
// @route   POST /api/employees/:id/performance
// @access  Admin
exports.addPerformanceReview = asyncHandler(async (req, res, next) => {
  const { rating, notes, reviewDate } = req.body;

  const employee = await Employee.findById(req.params.id);

  if (!employee) {
    return next(new ErrorResponse(`Employee not found with id of ${req.params.id}`, 404));
  }

  employee.performance = {
    rating,
    lastReviewDate: reviewDate || Date.now(),
    nextReviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    notes
  };

  await employee.save();

  res.status(200).json({
    success: true,
    data: employee
  });
});
