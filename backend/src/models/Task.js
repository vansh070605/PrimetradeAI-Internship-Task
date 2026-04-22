/**
 * @file Task.js
 * @description Mongoose schema for the Task entity.
 *              Each task is owned by a User and has a lifecycle status.
 */

const mongoose = require('mongoose');

const TASK_STATUSES = ['todo', 'in-progress', 'done'];
const TASK_PRIORITIES = ['low', 'medium', 'high'];

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: TASK_STATUSES,
        message: `Status must be one of: ${TASK_STATUSES.join(', ')}`,
      },
      default: 'todo',
    },
    priority: {
      type: String,
      enum: {
        values: TASK_PRIORITIES,
        message: `Priority must be one of: ${TASK_PRIORITIES.join(', ')}`,
      },
      default: 'medium',
    },
    // Reference to the User who owns this task
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task must belong to a user'],
      index: true, // Index for efficient filtering by user
    },
    dueDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Compound index for efficient filtering: get all tasks for a user by status
taskSchema.index({ user: 1, status: 1 });
taskSchema.index({ user: 1, createdAt: -1 });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
