const API_BASE = import.meta.env.VITE_API_URL
  || (window.location.hostname.includes('onrender.com') || window.location.hostname.includes('vercel.app')
    ? 'https://reunion-backend-cd8x.onrender.com/api'
    : '/api');

async function request(url, options = {}) {
  const token = localStorage.getItem('reunion_token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('reunion_token');
    localStorage.removeItem('reunion_admin');
    if (window.location.pathname.startsWith('/admin/dashboard')) {
      window.location.href = '/admin/login';
    }
    throw new Error('Unauthorized');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
}

export const api = {
  // Public
  checkHealth: () => request('/health'),

  submitPayment: (data) => request('/payments', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  getBkashInfo: () => request('/bkash-info'),

  // Auth
  login: (data) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Admin
  getStats: () => request('/admin/stats'),

  getPayments: (status) => {
    const params = status ? `?status=${status}` : '';
    return request(`/payments${params}`);
  },

  updatePayment: (id, data) => request(`/payments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  deletePayment: (id) => request(`/payments/${id}`, {
    method: 'DELETE',
  }),

  // Notifications
  getNotifications: () => request('/admin/notifications'),

  getUnreadCount: () => request('/admin/notifications/count'),

  markNotificationRead: (id) => request(`/admin/notifications/${id}/read`, {
    method: 'PUT',
  }),

  markAllNotificationsRead: () => request('/admin/notifications/read-all', {
    method: 'PUT',
  }),
};

export default api;
