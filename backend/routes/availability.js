const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getAvailability, setAvailability } = require('../controllers/bookingController');

router.get('/', authenticate, getAvailability);
router.post('/', authenticate, setAvailability);

module.exports = router;
