const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const complaintRoutes = require('./complaint.routes');
const statsRoutes = require('./stats.routes');
const userRoutes = require('./user.routes');

// Health check endpoint (vital for AWS EC2/Target Group/monitoring)
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Campus Complaint Management System API',
    uptime: process.uptime()
  });
});

router.use('/auth', authRoutes);
router.use('/complaints', complaintRoutes);
router.use('/stats', statsRoutes);
router.use('/users', userRoutes);

module.exports = router;
