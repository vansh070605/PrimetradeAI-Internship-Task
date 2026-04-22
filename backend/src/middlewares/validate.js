/**
 * @file validate.js
 * @description Generic Joi validation middleware factory.
 *              Usage: router.post('/route', validate(schema), controller)
 */

const ApiError = require('../utils/ApiError');

/**
 * Returns Express middleware that validates req.body against a Joi schema.
 * On failure it passes a 400 ApiError to the centralized error handler.
 *
 * @param {import('joi').Schema} schema - Joi schema to validate against
 * @param {'body'|'query'|'params'} target - Which part of request to validate
 */
const validate = (schema, target = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[target], {
      abortEarly: false, // collect ALL errors, not just the first
      allowUnknown: false, // reject unknown fields (prevents mass assignment)
      stripUnknown: true, // strip unexpected fields from validated value
    });

    if (error) {
      // Join all validation error messages into one readable string
      const message = error.details.map((d) => d.message).join('; ');
      return next(new ApiError(400, message));
    }

    // Replace req[target] with the validated (and sanitized) value
    req[target] = value;
    next();
  };
};

module.exports = validate;
