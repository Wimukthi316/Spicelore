const express = require('express');
const {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeStats,
  getEmployeesByDepartment,
  updateEmployeeStatus,
  addPerformanceReview
} = require('../controllers/employeeController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected and require admin access
router.use(protect);
router.use(authorize('admin'));

router
  .route('/')
  .get(getEmployees)
  .post(createEmployee);

router.get('/stats', getEmployeeStats);
router.get('/department/:dept', getEmployeesByDepartment);

router
  .route('/:id')
  .get(getEmployee)
  .put(updateEmployee)
  .delete(deleteEmployee);

router.put('/:id/status', updateEmployeeStatus);
router.post('/:id/performance', addPerformanceReview);

module.exports = router;
