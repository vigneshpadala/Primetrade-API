const { validationResult } = require('express-validator');
const { sendError } = require('../utils/apiResponse');

/**
 * Runs validation results and returns 400 if errors exist
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
      value: err.value,
    }));
    return sendError(res, 400, 'Validation failed', formattedErrors);
  }
  next();
};

module.exports = { validate };
