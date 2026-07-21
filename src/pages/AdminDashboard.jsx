import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [payments, setPayments] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Notification state
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Password change state (Mokles only)
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [adminUsers, setAdminUsers] = useState([]);
  const [passwordForm, setPasswordForm] = useState({ targetMobileNumber: '', newPassword: '', confirmPassword: '' });
  const [passwordMsg, setPasswordMsg] = useState('');

  const admin = JSON.parse(localStorage.getItem('reunion_admin') || '{}');
  const isSuperAdmin = admin.mobileNumber === '01679783313'; // Mokles

  const fetchData = useCallback(async () => {
    try {
      const [statsData, paymentsData] = await Promise.all([
        api.getStats(),
        api.getPayments(filter === 'ALL' ? null : filter),
      ]);
      setStats(statsData);
      setPayments(paymentsData);
    } catch (err) {
      if (err.message === 'Unauthorized') {
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  }, [filter, navigate]);

  const fetchNotifications = useCallback(async () => {
    try {
      const [countData, notifData] = await Promise.all([
        api.getUnreadCount(),
        api.getNotifications(),
      ]);
      setUnreadCount(countData.count);
      setNotifications(notifData);
    } catch (err) {
      // silently fail for notifications
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('reunion_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchData();
    fetchNotifications();

    // Poll for notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchData, fetchNotifications, navigate]);

  const handleStatusChange = async (id, status) => {
    try {
      await api.updatePayment(id, { status });
      fetchData();
      fetchNotifications();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deletePayment(id);
      setDeleteConfirm(null);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEditSave = async () => {
    if (!editModal) return;
    try {
      await api.updatePayment(editModal.id, {
        rank: editModal.rank,
        name: editModal.name,
        mobileNumber: editModal.mobileNumber,
        transactionId: editModal.transactionId,
        status: editModal.status,
      });
      setEditModal(null);
      fetchData();
      fetchNotifications();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('reunion_token');
    localStorage.removeItem('reunion_admin');
    navigate('/admin/login');
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      // silently fail
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      // silently fail
    }
  };

  // Password change handlers
  const openPasswordModal = async () => {
    try {
      const users = await api.getAdminUsers();
      setAdminUsers(users);
      setPasswordForm({ targetMobileNumber: '', newPassword: '', confirmPassword: '' });
      setPasswordMsg('');
      setShowPasswordModal(true);
    } catch (err) {
      alert('Failed to load admin users');
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.targetMobileNumber) {
      setPasswordMsg('Please select an admin');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordMsg('Password must be at least 6 characters');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg('Passwords do not match');
      return;
    }
    try {
      await api.changePassword(passwordForm.targetMobileNumber, passwordForm.newPassword);
      setPasswordMsg('✅ Password changed successfully!');
      setPasswordForm({ targetMobileNumber: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordMsg('❌ ' + (err.message || 'Failed to change password'));
    }
  };

  const handleExportCSV = () => {
    const headers = ['#', 'Rank', 'Name', 'Mobile', 'Transaction ID', 'Amount', 'Status', 'Date'];
    const rows = filteredPayments.map((p, i) => [
      i + 1,
      p.rank,
      p.name,
      p.mobileNumber,
      p.transactionId,
      p.amount,
      p.status,
      new Date(p.createdAt).toLocaleDateString('en-BD'),
    ]);

    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reunion-payments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredPayments = payments.filter((p) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.name?.toLowerCase().includes(term) ||
      p.mobileNumber?.includes(term) ||
      p.transactionId?.toLowerCase().includes(term) ||
      p.rank?.toLowerCase().includes(term)
    );
  });

  const getTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner"></div>
        <p style={{ color: 'var(--text-muted)' }}>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="container">
          <h1>🎖️ Reunion Dashboard</h1>
          <div className="admin-info">
            {/* Notification Bell */}
            <div className="notification-wrapper">
              <button
                className="notification-bell"
                onClick={() => setShowNotifications(!showNotifications)}
                title="Notifications"
              >
                🔔
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="notification-dropdown">
                  <div className="notification-dropdown-header">
                    <h3>Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        className="notification-mark-all"
                        onClick={handleMarkAllRead}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="notification-list">
                    {notifications.length === 0 ? (
                      <div className="notification-empty">No notifications yet</div>
                    ) : (
                      notifications.slice(0, 20).map((notif) => (
                        <div
                          key={notif.id}
                          className={`notification-item ${!notif.read ? 'unread' : ''}`}
                          onClick={() => !notif.read && handleMarkRead(notif.id)}
                        >
                          <div className="notification-icon">
                            {notif.type === 'NEW_PAYMENT' && '📋'}
                            {notif.type === 'PAYMENT_VERIFIED' && '✅'}
                            {notif.type === 'PAYMENT_REJECTED' && '❌'}
                          </div>
                          <div className="notification-content">
                            <div className="notification-title">{notif.title}</div>
                            <div className="notification-message">{notif.message}</div>
                            <div className="notification-time">
                              {getTimeAgo(notif.createdAt)}
                            </div>
                          </div>
                          {!notif.read && <div className="notification-dot"></div>}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <span>Welcome, <strong style={{ color: 'var(--gold)' }}>{admin.name}</strong></span>
            {isSuperAdmin && (
              <button className="btn btn-secondary btn-sm" onClick={openPasswordModal}>
                🔑 Passwords
              </button>
            )}
            <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Click outside to close notifications */}
      {showNotifications && (
        <div
          className="notification-overlay"
          onClick={() => setShowNotifications(false)}
        />
      )}

      {/* Body */}
      <div className="dashboard-body">
        <div className="container">
          {/* Stats */}
          {stats && (
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📋</div>
                <div className="stat-value">{stats.totalRegistrations}</div>
                <div className="stat-label">Total Registrations</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-value">{stats.verifiedPayments}</div>
                <div className="stat-label">Verified</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⏳</div>
                <div className="stat-value">{stats.pendingPayments}</div>
                <div className="stat-label">Pending</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-value">৳{stats.verifiedAmount?.toLocaleString()}</div>
                <div className="stat-label">Verified Amount</div>
              </div>
            </div>
          )}

          {/* Payments Table */}
          <div className="table-container">
            <div className="table-header">
              <h2>Payment Records</h2>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="search-bar">
                  <input
                    type="text"
                    placeholder="Search by name, mobile, TxnID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="table-filters">
                  {['ALL', 'PENDING', 'VERIFIED', 'REJECTED'].map((f) => (
                    <button
                      key={f}
                      className={`filter-btn ${filter === f ? 'active' : ''}`}
                      onClick={() => setFilter(f)}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}>
                  📥 Export CSV
                </button>
              </div>
            </div>

            {filteredPayments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <p>No payment records found</p>
              </div>
            ) : (
              <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Rank</th>
                    <th>Name</th>
                    <th>Mobile</th>
                    <th>TxnID</th>
                    <th>Amt</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment, idx) => (
                    <tr key={payment.id}>
                      <td data-label="#">{idx + 1}</td>
                      <td data-label="Rank">{payment.rank}</td>
                      <td data-label="Name" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                        {payment.name}
                      </td>
                      <td data-label="Mobile">{payment.mobileNumber}</td>
                      <td data-label="TxnID" style={{ fontFamily: 'monospace', color: 'var(--gold)', fontSize: '0.8rem' }}>
                        {payment.transactionId}
                      </td>
                      <td data-label="Amount">৳{payment.amount?.toLocaleString()}</td>
                      <td data-label="Status">
                        <span className={`status-badge ${payment.status?.toLowerCase()}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td data-label="Date">
                        {payment.createdAt
                          ? new Date(payment.createdAt).toLocaleDateString('en-BD')
                          : '—'}
                      </td>
                      <td data-label="Actions">
                        <div className="action-btns">
                          {payment.status !== 'VERIFIED' && (
                            <button
                              className="action-btn verify"
                              onClick={() => handleStatusChange(payment.id, 'VERIFIED')}
                              title="Verify"
                            >
                              ✅
                            </button>
                          )}
                          {payment.status !== 'REJECTED' && (
                            <button
                              className="action-btn reject"
                              onClick={() => handleStatusChange(payment.id, 'REJECTED')}
                              title="Reject"
                            >
                              ❌
                            </button>
                          )}
                          <button
                            className="action-btn"
                            onClick={() => setEditModal({ ...payment })}
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            className="action-btn delete"
                            onClick={() => setDeleteConfirm(payment)}
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editModal && (
        <div className="modal-overlay" onClick={() => setEditModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Payment</h2>
            <div className="form-group">
              <label>Rank</label>
              <input
                value={editModal.rank || ''}
                onChange={(e) => setEditModal({ ...editModal, rank: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Name</label>
              <input
                value={editModal.name || ''}
                onChange={(e) => setEditModal({ ...editModal, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Mobile Number</label>
              <input
                value={editModal.mobileNumber || ''}
                onChange={(e) => setEditModal({ ...editModal, mobileNumber: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Transaction ID</label>
              <input
                value={editModal.transactionId || ''}
                onChange={(e) => setEditModal({ ...editModal, transactionId: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                value={editModal.status || 'PENDING'}
                onChange={(e) => setEditModal({ ...editModal, status: e.target.value })}
              >
                <option value="PENDING">Pending</option>
                <option value="VERIFIED">Verified</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary btn-sm" onClick={() => setEditModal(null)}>
                Cancel
              </button>
              <button className="btn btn-primary btn-sm" onClick={handleEditSave}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Confirm Delete</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Are you sure you want to delete the payment record for{' '}
              <strong style={{ color: 'var(--text-primary)' }}>{deleteConfirm.name}</strong>?
              This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="btn btn-secondary btn-sm" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleDelete(deleteConfirm.id)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal (Mokles only) */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>🔑 Change Password</h2>
            <div className="form-group">
              <label>Select Admin</label>
              <select
                value={passwordForm.targetMobileNumber}
                onChange={(e) => setPasswordForm({ ...passwordForm, targetMobileNumber: e.target.value })}
              >
                <option value="">-- Select Admin --</option>
                {adminUsers.map((u) => (
                  <option key={u.mobileNumber} value={u.mobileNumber}>
                    {u.name} ({u.mobileNumber})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                placeholder="Min 6 characters"
              />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                placeholder="Re-enter password"
              />
            </div>
            {passwordMsg && (
              <p style={{ color: passwordMsg.startsWith('✅') ? '#4ade80' : '#ef4444', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                {passwordMsg}
              </p>
            )}
            <div className="modal-actions">
              <button className="btn btn-secondary btn-sm" onClick={() => setShowPasswordModal(false)}>
                Close
              </button>
              <button className="btn btn-primary btn-sm" onClick={handleChangePassword}>
                Change Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
