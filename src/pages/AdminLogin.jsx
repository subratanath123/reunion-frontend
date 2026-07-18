import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ mobileNumber: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.mobileNumber.trim() || !form.password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await api.login(form);
      localStorage.setItem('reunion_token', response.token);
      localStorage.setItem('reunion_admin', JSON.stringify({
        name: response.name,
        mobileNumber: response.mobileNumber,
      }));
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page">
      <div className="form-container" style={{ maxWidth: '420px' }}>
        <div className="form-header">
          <img src="/logo.jpg" alt="Logo" />
          <h1>Admin Login</h1>
          <p>Access the reunion dashboard</p>
        </div>

        <Link to="/" className="back-link">← Back to Home</Link>

        <div className="form-card">
          {error && (
            <div className="form-alert error">{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="mobileNumber">Mobile Number</label>
              <input
                type="tel"
                id="mobileNumber"
                name="mobileNumber"
                placeholder="01XXXXXXXXX"
                value={form.mobileNumber}
                onChange={handleChange}
                autoComplete="tel"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span> Signing in...
                </>
              ) : (
                '🔐 Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
