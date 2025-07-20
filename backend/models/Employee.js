const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Employee name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters'],
    match: [/^[A-Za-z\s]+$/, 'Name can only contain letters and spaces']
  },
  empid: {
    type: String,
    required: [true, 'Employee ID is required'],
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^[A-Z0-9]+$/, 'Employee ID must contain only capital letters and numbers']
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    trim: true,
    enum: [
      'Manager',
      'Assistant Manager',
      'Sales Representative',
      'Inventory Specialist',
      'Customer Service',
      'Packaging Specialist',
      'Quality Control',
      'Administrative Assistant',
      'Marketing Coordinator',
      'Procurement Officer'
    ]
  },
  contact: {
    type: String,
    required: [true, 'Contact information is required'],
    trim: true,
    validate: {
      validator: function(v) {
        // Check if it's an email or phone number
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return emailRegex.test(v) || phoneRegex.test(v);
      },
      message: 'Contact must be a valid email address or phone number'
    }
  },
  department: {
    type: String,
    enum: [
      'Sales',
      'Inventory',
      'Customer Service',
      'Operations',
      'Marketing',
      'Quality Assurance',
      'Procurement',
      'Administration'
    ],
    default: 'Operations'
  },
  salary: {
    type: Number,
    min: [0, 'Salary cannot be negative']
  },
  hireDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'On Leave', 'Terminated'],
    default: 'Active'
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'Sri Lanka'
    }
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
    email: String
  },
  skills: [{
    type: String,
    trim: true
  }],
  certifications: [{
    name: String,
    issuedBy: String,
    issueDate: Date,
    expiryDate: Date,
    certificateNumber: String
  }],
  performance: {
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    lastReviewDate: Date,
    nextReviewDate: Date,
    notes: String
  },
  workSchedule: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
    default: 'Full-time'
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  profileImage: {
    type: String,
    default: 'default-employee.png'
  }
}, {
  timestamps: true
});

// Index for better search performance
// empid index is automatically created by unique: true
employeeSchema.index({ name: 'text', role: 'text' });
employeeSchema.index({ department: 1 });
employeeSchema.index({ status: 1 });

// Virtual for employee's full name with ID
employeeSchema.virtual('displayName').get(function() {
  return `${this.name} (${this.empid})`;
});

// Virtual for years of service
employeeSchema.virtual('yearsOfService').get(function() {
  const now = new Date();
  const hireDate = new Date(this.hireDate);
  const diffTime = Math.abs(now - hireDate);
  const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
  return Math.floor(diffYears);
});

// Method to check if employee is active
employeeSchema.methods.isActive = function() {
  return this.status === 'Active';
};

// Method to calculate age if birthDate is added later
employeeSchema.methods.calculateAge = function() {
  if (this.birthDate) {
    const today = new Date();
    const birthDate = new Date(this.birthDate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
  return null;
};

// Static method to get employees by department
employeeSchema.statics.getByDepartment = function(department) {
  return this.find({ department: department, status: 'Active' });
};

// Static method to get active employees count
employeeSchema.statics.getActiveCount = function() {
  return this.countDocuments({ status: 'Active' });
};

// Pre-save middleware to generate employee ID if not provided
employeeSchema.pre('save', async function(next) {
  if (!this.empid) {
    const count = await this.constructor.countDocuments();
    this.empid = `EMP${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Employee', employeeSchema);
