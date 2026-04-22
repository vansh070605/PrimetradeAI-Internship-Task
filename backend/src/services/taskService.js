/**
 * @file taskService.js
 * @description Business logic for task CRUD operations.
 *              Enforces ownership rules: users only access their own tasks;
 *              admins can access all tasks.
 */

const Task = require('../models/Task');
const ApiError = require('../utils/ApiError');

/**
 * Builds a MongoDB filter based on user role.
 * Admin → no user restriction; user → only their tasks.
 *
 * @param {string} userId - Requesting user's ID
 * @param {string} role   - Requesting user's role
 * @returns {Object} Mongoose query filter
 */
const buildOwnershipFilter = (userId, role) => {
  return role === 'admin' ? {} : { user: userId };
};

/**
 * Creates a new task owned by the requesting user.
 *
 * @param {Object} taskData - Validated task fields
 * @param {string} userId   - Owning user's ID
 * @returns {Object}        Created task document
 */
const createTask = async (taskData, userId) => {
  const task = await Task.create({ ...taskData, user: userId });
  return task;
};

/**
 * Retrieves tasks with optional filtering and pagination.
 * - Regular users only see their own tasks.
 * - Admins see all tasks.
 *
 * @param {Object} options   - Query options
 * @param {string} userId    - Requesting user's ID
 * @param {string} role      - Requesting user's role
 * @returns {{ tasks: Array, total: number, page: number, totalPages: number }}
 */
const getAllTasks = async ({ status, priority, page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' }, userId, role) => {
  const filter = buildOwnershipFilter(userId, role);

  // Apply optional filters
  if (status) filter.status = status;
  if (priority) filter.priority = priority;

  const skip = (page - 1) * limit;
  const sortOrder = order === 'asc' ? 1 : -1;

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .populate('user', 'name email') // Populate lean user info
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(Number(limit))
      .lean(), // lean() returns plain JS objects — faster for read-only
    Task.countDocuments(filter),
  ]);

  return {
    tasks,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Retrieves a single task by ID.
 * Enforces ownership for non-admin users.
 *
 * @param {string} taskId - Task's MongoDB ID
 * @param {string} userId - Requesting user's ID
 * @param {string} role   - Requesting user's role
 * @returns {Object}      Task document
 */
const getTaskById = async (taskId, userId, role) => {
  const task = await Task.findById(taskId).populate('user', 'name email');

  if (!task) {
    throw new ApiError(404, 'Task not found.');
  }

  // Ownership check: only admins can view other users' tasks
  if (role !== 'admin' && task.user._id.toString() !== userId) {
    throw new ApiError(403, 'You do not have permission to view this task.');
  }

  return task;
};

/**
 * Updates a task by ID.
 * Enforces ownership for non-admin users.
 *
 * @param {string} taskId   - Task's MongoDB ID
 * @param {Object} updates  - Validated fields to update
 * @param {string} userId   - Requesting user's ID
 * @param {string} role     - Requesting user's role
 * @returns {Object}        Updated task document
 */
const updateTask = async (taskId, updates, userId, role) => {
  const task = await Task.findById(taskId);

  if (!task) {
    throw new ApiError(404, 'Task not found.');
  }

  if (role !== 'admin' && task.user.toString() !== userId) {
    throw new ApiError(403, 'You do not have permission to update this task.');
  }

  // Apply updates — new: true returns the updated document
  const updatedTask = await Task.findByIdAndUpdate(
    taskId,
    { $set: updates },
    { new: true, runValidators: true }
  ).populate('user', 'name email');

  return updatedTask;
};

/**
 * Deletes a task by ID.
 * Enforces ownership for non-admin users.
 *
 * @param {string} taskId - Task's MongoDB ID
 * @param {string} userId - Requesting user's ID
 * @param {string} role   - Requesting user's role
 */
const deleteTask = async (taskId, userId, role) => {
  const task = await Task.findById(taskId);

  if (!task) {
    throw new ApiError(404, 'Task not found.');
  }

  if (role !== 'admin' && task.user.toString() !== userId) {
    throw new ApiError(403, 'You do not have permission to delete this task.');
  }

  await task.deleteOne();
};

module.exports = { createTask, getAllTasks, getTaskById, updateTask, deleteTask };
