const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

// Protected dashboard routes
router.use(protect);

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get dashboard statistics, monthly chart data, student summaries & recent lessons
 * @access  Private
 */
router.get('/stats', getDashboardStats);

module.exports = router;
