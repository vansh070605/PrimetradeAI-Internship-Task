/**
 * @file Navbar.jsx
 * @description Top navigation bar — shows user info and logout button.
 */

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-icon">✓</span>
        <span className="brand-name">TaskFlow</span>
      </div>
      <div className="navbar-user">
        <span className="user-badge" title={`Role: ${user?.role}`}>
          {user?.role === 'admin' ? '👑 Admin' : '👤 User'}
        </span>
        <span className="user-email">{user?.email}</span>
        <button className="btn btn-outline" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
