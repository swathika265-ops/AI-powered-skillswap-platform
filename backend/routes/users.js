const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { getProfile, updateProfile, getUserById, getAllUsers, updateUserStatus } = require('../controllers/userController');

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.get('/all', authenticate, authorize('admin'), getAllUsers);
router.get('/:id', getUserById);
router.patch('/:id/status', authenticate, authorize('admin'), updateUserStatus);

module.exports = router;
