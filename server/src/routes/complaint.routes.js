const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaint.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const upload = require('../middleware/upload.middleware');
const {
  createComplaintValidator,
  updateStatusValidator,
  assignStaffValidator,
  complaintIdValidator,
  listComplaintsValidator
} = require('../validators/complaint.validator');

// All complaint routes require authentication
router.use(authenticate);

// Student creates complaint
router.post(
  '/',
  authorize('STUDENT'),
  upload.single('attachment'),
  createComplaintValidator,
  complaintController.createComplaint
);

// List complaints (scoped by role inside controller)
router.get('/', listComplaintsValidator, complaintController.getComplaints);

// View specific complaint
router.get('/:id/history', complaintIdValidator, complaintController.getComplaintHistory);
router.get('/:id', complaintIdValidator, complaintController.getComplaintById);

// Admin assigns complaint to staff
router.put(
  '/:id/assign',
  authorize('ADMIN'),
  assignStaffValidator,
  complaintController.assignStaff
);

// Admin or Assigned Staff updates status
router.put(
  '/:id/status',
  authorize('ADMIN', 'STAFF'),
  updateStatusValidator,
  complaintController.updateStatus
);

module.exports = router;
