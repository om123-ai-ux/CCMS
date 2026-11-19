const express = require('express');
const router = express.Router();
const statsController = require('../controllers/stats.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);
router.get('/', statsController.getDashboardStats);

module.exports = router;
