/**
 * @file TaskCard.jsx
 * @description Displays a single task with status badge, priority indicator,
 *              and edit/delete action buttons.
 */

const STATUS_COLORS = {
  todo: '#6366f1',
  'in-progress': '#f59e0b',
  done: '#22c55e',
};

const PRIORITY_COLORS = {
  low: '#94a3b8',
  medium: '#f59e0b',
  high: '#ef4444',
};

const TaskCard = ({ task, onEdit, onDelete, deleting }) => {
  const statusColor = STATUS_COLORS[task.status] || '#6366f1';
  const priorityColor = PRIORITY_COLORS[task.priority] || '#94a3b8';

  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="task-card" data-status={task.status}>
      <div className="task-card-header">
        <div className="task-status-badge" style={{ backgroundColor: statusColor }}>
          {task.status.replace('-', ' ')}
        </div>
        <div className="task-priority-dot" style={{ backgroundColor: priorityColor }} title={`Priority: ${task.priority}`} />
      </div>

      <h3 className="task-title">{task.title}</h3>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-meta">
        {task.dueDate && (
          <span className="task-due">📅 Due: {formatDate(task.dueDate)}</span>
        )}
        <span className="task-created">
          Created: {formatDate(task.createdAt)}
        </span>
        {task.user?.email && (
          <span className="task-owner">👤 {task.user.email}</span>
        )}
      </div>

      <div className="task-actions">
        <button
          className="btn btn-sm btn-outline"
          onClick={() => onEdit(task)}
          id={`edit-task-${task._id}`}
        >
          ✏️ Edit
        </button>
        <button
          className="btn btn-sm btn-danger"
          onClick={() => onDelete(task._id)}
          disabled={deleting === task._id}
          id={`delete-task-${task._id}`}
        >
          {deleting === task._id ? 'Deleting...' : '🗑️ Delete'}
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
