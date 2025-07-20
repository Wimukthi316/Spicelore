const express = require('express');
const {
  getProfile,
  updateProfile,
  uploadAvatar,
  updatePassword,
  deleteAccount
} = require('../controllers/profileController');

const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

router
  .route('/')
  .get(getProfile)
  .put(updateProfile)
  .delete(deleteAccount);

router.put('/avatar', uploadAvatar);
router.put('/password', updatePassword);

module.exports = router;