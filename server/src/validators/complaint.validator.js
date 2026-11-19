const { body, param, query, validationResult } = require('express-validator');
const { errorResponse } = require('../utils/response');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg
    }));
    return errorResponse(res, 'Validation failed', 400, formattedErrors);
  }
  next();
};

const CATEGORIES = [
  'IT and Wi-Fi',
  'Electrical',
  'Infrastructure',
  'Hostel',
  'Cleaning',
  'Other'
];

const STATUSES = [
  'PENDING',
  'ASSIGNED',
  'IN_PROGRESS',
  'RESOLVED'
];

const createComplaintValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Complaint title is required')
    .isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Complaint description is required')
    .isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required')
    .isIn(CATEGORIES).withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),
  handleValidationErrors
];

const updateStatusValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('Valid complaint ID is required'),
  body('status')
    .trim()
    .notEmpty().withMessage('Status is required')
    .isIn(STATUSES).withMessage(`Status must be one of: ${STATUSES.join(', ')}`),
  body('remarks')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 }).withMessage('Remarks cannot exceed 1000 characters'),
  handleValidationErrors
];

const assignStaffValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('Valid complaint ID is required'),
  body('staffId')
    .notEmpty().withMessage('Staff ID is required')
    .isInt({ min: 1 }).withMessage('Staff ID must be a valid user ID'),
  body('remarks')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 }).withMessage('Remarks cannot exceed 1000 characters'),
  handleValidationErrors
];

const complaintIdValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('Valid complaint ID is required'),
  handleValidationErrors
];

const listComplaintsValidator = [
  query('status')
    .optional()
    .isIn(STATUSES).withMessage(`Status must be one of: ${STATUSES.join(', ')}`),
  query('category')
    .optional()
    .isIn(CATEGORIES).withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),
  query('search')
    .optional()
    .isLength({ max: 200 }).withMessage('Search cannot exceed 200 characters'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('offset')
    .optional()
    .isInt({ min: 0, max: 1000000 }).withMessage('Offset must be a non-negative integer'),
  query('assignedStaffId')
    .optional()
    .isInt({ min: 1 }).withMessage('Assigned staff ID must be a valid user ID'),
  query('studentId')
    .optional()
    .isInt({ min: 1 }).withMessage('Student ID must be a valid user ID'),
  handleValidationErrors
];

module.exports = {
  CATEGORIES,
  STATUSES,
  createComplaintValidator,
  updateStatusValidator,
  assignStaffValidator,
  complaintIdValidator,
  listComplaintsValidator
};
