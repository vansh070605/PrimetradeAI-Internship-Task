/**
 * @file Dashboard.jsx
 * @description Main dashboard — task list with create, edit, delete, and filter capabilities.
 */

import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Create / Edit modal state
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Filters
  const [filters, setFilters] = useState({ status: '', priority: '', page: 1 });

  // ── Fetch Tasks ─────────────────────────────────────────────────────────────
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      params.page = filters.page;
      params.limit = 9;

      const { data } = await axiosInstance.get('/tasks', { params });
      setTasks(data.data.tasks);
      setPagination(data.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const showMessage = (msg, isError = false) => {
    if (isError) {
      setError(msg);
      setTimeout(() => setError(''), 4000);
    } else {
      setSuccess(msg);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  // ── Create / Update ─────────────────────────────────────────────────────────
  const handleFormSubmit = async (formData) => {
    setFormLoading(true);
    try {
      if (editingTask) {
        await axiosInstance.put(`/tasks/${editingTask._id}`, formData);
        showMessage('Task updated successfully!');
      } else {
        await axiosInstance.post('/tasks', formData);
        showMessage('Task created successfully!');
      }
      setShowForm(false);
      setEditingTask(null);
      fetchTasks();
    } catch (err) {
      showMessage(err.response?.data?.message || 'Operation failed.', true);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task? This cannot be undone.')) return;
    setDeletingId(taskId);
    try {
      await axiosInstance.delete(`/tasks/${taskId}`);
      showMessage('Task deleted.');
      fetchTasks();
    } catch (err) {
      showMessage(err.response?.data?.message || 'Delete failed.', true);
    } finally {
      setDeletingId(null);
    }
  };

  // ── Filter Handlers ─────────────────────────────────────────────────────────
  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value, page: 1 }));
  };

  const clearFilters = () => setFilters({ status: '', priority: '', page: 1 });

  return (
    <div className="dashboard-layout">
      <Navbar />

      <main className="dashboard-main">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">My Tasks</h1>
            <p className="dashboard-subtitle">
              {pagination.total} task{pagination.total !== 1 ? 's' : ''} total
              {user?.role === 'admin' && ' (admin view — all users)'}
            </p>
          </div>
          <button
            id="new-task-btn"
            className="btn btn-primary"
            onClick={() => { setEditingTask(null); setShowForm(true); }}
          >
            + New Task
          </button>
        </div>

        {/* ── Alerts ─────────────────────────────────────────────────── */}
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* ── Create / Edit Form ──────────────────────────────────────── */}
        {showForm && (
          <div className="form-panel">
            <h2>{editingTask ? 'Edit Task' : 'New Task'}</h2>
            <TaskForm
              initialData={editingTask}
              onSubmit={handleFormSubmit}
              onCancel={() => { setShowForm(false); setEditingTask(null); }}
              loading={formLoading}
            />
          </div>
        )}

        {/* ── Filters ─────────────────────────────────────────────────── */}
        <div className="filters-bar">
          <select
            name="status"
            id="filter-status"
            value={filters.status}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Statuses</option>
            <option value="todo">Todo</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>

          <select
            name="priority"
            id="filter-priority"
            value={filters.priority}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          {(filters.status || filters.priority) && (
            <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
              Clear Filters
            </button>
          )}
        </div>

        {/* ── Task Grid ───────────────────────────────────────────────── */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No tasks found</h3>
            <p>Create your first task to get started.</p>
          </div>
        ) : (
          <div className="task-grid">
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onEdit={handleEdit}
                onDelete={handleDelete}
                deleting={deletingId}
              />
            ))}
          </div>
        )}

        {/* ── Pagination ──────────────────────────────────────────────── */}
        {pagination.totalPages > 1 && (
          <div className="pagination">
            <button
              id="prev-page-btn"
              className="btn btn-outline btn-sm"
              disabled={pagination.page <= 1}
              onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
            >
              ← Prev
            </button>
            <span className="page-info">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              id="next-page-btn"
              className="btn btn-outline btn-sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
            >
              Next →
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
