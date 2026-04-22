/**
 * @file TaskForm.jsx
 * @description Form for creating or editing a task.
 *              Receives optional `task` prop for edit mode.
 */

import { useState } from 'react';

const STATUSES = ['todo', 'in-progress', 'done'];
const PRIORITIES = ['low', 'medium', 'high'];

const TaskForm = ({ onSubmit, onCancel, initialData = null, loading = false }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    status: initialData?.status || 'todo',
    priority: initialData?.priority || 'medium',
    dueDate: initialData?.dueDate
      ? new Date(initialData.dueDate).toISOString().split('T')[0]
      : '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Strip empty dueDate before submitting
    const payload = { ...formData };
    if (!payload.dueDate) delete payload.dueDate;
    onSubmit(payload);
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="task-title">Title *</label>
        <input
          id="task-title"
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Task title"
          required
          minLength={3}
          maxLength={100}
        />
      </div>

      <div className="form-group">
        <label htmlFor="task-desc">Description</label>
        <textarea
          id="task-desc"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Task description (optional)"
          rows={3}
          maxLength={1000}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="task-status">Status</label>
          <select id="task-status" name="status" value={formData.status} onChange={handleChange}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ')}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="task-priority">Priority</label>
          <select id="task-priority" name="priority" value={formData.priority} onChange={handleChange}>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="task-due">Due Date</label>
          <input
            id="task-due"
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : initialData ? 'Update Task' : 'Create Task'}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default TaskForm;
