const { body, query, param } = require('express-validator');

const createTaskValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 100 }).withMessage('Title must be 3–100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),

  body('status')
    .optional()
    .isIn(['todo', 'in_progress', 'done']).withMessage('Status must be todo, in_progress, or done'),

  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),

  body('dueDate')
    .optional()
    .isISO8601().withMessage('Due date must be a valid date (ISO 8601)'),

  body('tags')
    .optional()
    .isArray({ max: 5 }).withMessage('Maximum 5 tags allowed'),

  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 }).withMessage('Each tag must be 1–20 characters'),
];

const updateTaskValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('Title must be 3–100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),

  body('status')
    .optional()
    .isIn(['todo', 'in_progress', 'done']).withMessage('Invalid status'),

  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),

  body('dueDate')
    .optional()
    .isISO8601().withMessage('Due date must be a valid ISO 8601 date'),
];

const getTasksValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1–100'),
  query('status').optional().isIn(['todo', 'in_progress', 'done']).withMessage('Invalid status filter'),
  query('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority filter'),
  query('sortBy').optional().isIn(['createdAt', 'updatedAt', 'title', 'priority', 'dueDate']),
  query('order').optional().isIn(['asc', 'desc']),
];

const taskIdValidator = [
  param('id').isMongoId().withMessage('Invalid task ID format'),
];

module.exports = {
  createTaskValidator,
  updateTaskValidator,
  getTasksValidator,
  taskIdValidator,
};
