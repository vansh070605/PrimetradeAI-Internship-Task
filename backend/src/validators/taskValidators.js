/**
 * @file taskValidators.js
 * @description Joi validation schemas for task-related endpoints.
 */

const Joi = require('joi');

const createTaskSchema = Joi.object({
  title: Joi.string().min(3).max(100).trim().required().messages({
    'string.min': 'Title must be at least 3 characters',
    'string.max': 'Title cannot exceed 100 characters',
    'any.required': 'Title is required',
  }),
  description: Joi.string().max(1000).trim().allow('').optional(),
  status: Joi.string().valid('todo', 'in-progress', 'done').default('todo'),
  priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
  dueDate: Joi.date().iso().allow(null).optional().messages({
    'date.format': 'Due date must be a valid ISO 8601 date',
  }),
});

const updateTaskSchema = Joi.object({
  title: Joi.string().min(3).max(100).trim().optional(),
  description: Joi.string().max(1000).trim().allow('').optional(),
  status: Joi.string().valid('todo', 'in-progress', 'done').optional(),
  priority: Joi.string().valid('low', 'medium', 'high').optional(),
  dueDate: Joi.date().iso().allow(null).optional(),
}).min(1); // At least one field must be provided

module.exports = { createTaskSchema, updateTaskSchema };
