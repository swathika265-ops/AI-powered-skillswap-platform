const { validationResult } = require('express-validator');

/**
 * Middleware that checks express-validator results
 * and returns 400 with error messages if validation failed.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      messages: errors.array().map((e) => e.msg),
      details: errors.array(),
    });
  }
  next();
};

module.exports = validate;
