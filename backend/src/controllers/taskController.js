/**
 * @file taskController.js
 * @description Thin HTTP layer for task routes.
 *              Delegates all business logic to taskService.
 */

const taskService = require('../services/taskService');
const ApiResponse = require('../utils/ApiResponse');

/**
 * POST /api/v1/tasks
 * Creates a new task for the authenticated user.
 */
const createTask = async (req, res, next) => {
  try {
    const task = await taskService.createTask(req.body, req.user.id);
    res.status(201).json(
      new ApiResponse(201, { task }, 'Task created successfully.')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/tasks
 * Returns tasks based on role:
 * - user  → only own tasks
 * - admin → all tasks
 *
 * Supports query params: status, priority, page, limit, sortBy, order
 */
const getAllTasks = async (req, res, next) => {
  try {
    const { status, priority, page, limit, sortBy, order } = req.query;

    const result = await taskService.getAllTasks(
      { status, priority, page, limit, sortBy, order },
      req.user.id,
      req.user.role
    );

    res.status(200).json(
      new ApiResponse(200, result, 'Tasks fetched successfully.')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/tasks/:id
 * Returns a single task. Enforces ownership for non-admins.
 */
const getTaskById = async (req, res, next) => {
  try {
    const task = await taskService.getTaskById(
      req.params.id,
      req.user.id,
      req.user.role
    );
    res.status(200).json(
      new ApiResponse(200, { task }, 'Task fetched successfully.')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/tasks/:id
 * Updates a task. Enforces ownership for non-admins.
 */
const updateTask = async (req, res, next) => {
  try {
    const task = await taskService.updateTask(
      req.params.id,
      req.body,
      req.user.id,
      req.user.role
    );
    res.status(200).json(
      new ApiResponse(200, { task }, 'Task updated successfully.')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/tasks/:id
 * Deletes a task. Enforces ownership for non-admins.
 */
const deleteTask = async (req, res, next) => {
  try {
    await taskService.deleteTask(req.params.id, req.user.id, req.user.role);
    res.status(200).json(
      new ApiResponse(200, null, 'Task deleted successfully.')
    );
  } catch (error) {
    next(error);
  }
};

module.exports = { createTask, getAllTasks, getTaskById, updateTask, deleteTask };
