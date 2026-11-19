const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { registerValidator } = require('../validators/auth.validator');

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/staff', userController.getStaffList);
router.get('/', userController.getAllUsers);
router.post('/staff', registerValidator, userController.createStaff);

module.exports = router;
