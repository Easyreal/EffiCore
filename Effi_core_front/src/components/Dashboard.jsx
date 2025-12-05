import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { LogOut, User, Mail, Calendar } from 'lucide-react';

const Dashboard = () => {
  const { user, logout, loading } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Today';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Today';
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Dashboard</h1>
          <button
            onClick={handleLogout}
            className="btn-logout"
            disabled={loading}
          >
            <LogOut size={20} />
            {loading ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="user-profile">
          <div className="profile-card">
            <div className="profile-header">
              <div className="avatar">
                <User size={48} />
              </div>
              <div className="profile-info">
                <h2>
                  Welcome, {user?.first_name || user?.login || 'User'}!
                </h2>
                <p className="profile-email">
                  <Mail size={16} />
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="profile-details">
              <div className="detail-item">
                <strong>Username:</strong>
                <span>@{user?.login || 'user'}</span>
              </div>
              <div className="detail-item">
                <strong>Status:</strong>
                <span className={`status ${user?.is_active ? 'active' : 'inactive'}`}>
                  {user?.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="detail-item">
                <strong>Member since:</strong>
                <span>
                  <Calendar size={14} />
                  {formatDate(user?.created_at)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-stats">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Profile Completion</h3>
              <div className="stat-value">85%</div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div className="stat-card">
              <h3>Account Status</h3>
              <div className="stat-value">
                <span className={`status-badge ${user?.is_active ? 'success' : 'warning'}`}>
                  {user?.is_active ? 'Verified' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;