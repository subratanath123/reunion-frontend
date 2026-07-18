import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const RANKS = [
  'Gunner',
  'Lance Naik',
  'Naik',
  'Havildar',
  'Sergeant',
  'Warrant Officer',
  'Senior Warrant Officer',
  'Master Warrant Officer',
  'Naib Subedar',
  'Subedar',
  'Subedar Major',
  'Honorary Lieutenant',
  'Honorary Captain',
  'Second Lieutenant',
  'Lieutenant',
  'Captain',
  'Major',
  'Lieutenant Colonel',
  'Colonel',
  'Brigadier General',
  'Major General',
  'Other',
];

export default function PaymentForm() {
  const [form, setForm] = useState({
    rank: '',
    name: '',
    mobileNumber: '',
    transactionId: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const errs = {};
    if (!form.rank) errs.rank = 'Please select your rank';
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.mobileNumber.trim()) {
      errs.mobileNumber = 'Mobile number is required';
    } else if (!/^01[3-9]\d{8}$/.test(form.mobileNumber)) {
      errs.mobileNumber = 'Invalid Bangladeshi mobile number';
    }
    if (!form.transactionId.trim()) {
      errs.transactionId = 'bKash Transaction ID is required';
    }
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      await api.submitPayment(form);
      setSuccess(true);
      setForm({ rank: '', name: '', mobileNumber: '', transactionId: '' });
    } catch (err) {
      setApiError(err.message || 'Failed to submit payment');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="form-page">
        <div className="form-container">
          <div className="form-header">
            <img src="/logo.jpg" alt="Logo" />
            <h1>Registration Successful!</h1>
          </div>
          <div className="form-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ color: 'var(--success)', marginBottom: '1rem', fontSize: '1.4rem' }}>
              Thank You, Comrade!
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.8' }}>
              Your payment details have been submitted successfully. 
              Our admin team will verify your bKash transaction shortly.
              We look forward to seeing you at the reunion!
            </p>
            <div className="btn-group">
              <Link to="/" className="btn btn-primary">
                ← Back to Home
              </Link>
              <button
                className="btn btn-secondary"
                onClick={() => setSuccess(false)}
              >
                Submit Another
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-page">
      <div className="form-container">
        <div className="form-header">
          <img src="/logo.jpg" alt="Logo" />
          <h1>Register for Reunion</h1>
          <p>Submit your bKash payment details</p>
        </div>

        <Link to="/" className="back-link">← Back to Home</Link>

        <div className="form-card">
          {apiError && (
            <div className="form-alert error">{apiError}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="rank">Rank</label>
              <select
                id="rank"
                name="rank"
                value={form.rank}
                onChange={handleChange}
              >
                <option value="">Select your rank</option>
                {RANKS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              {errors.rank && <div className="form-error">{errors.rank}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter your full name"
                value={form.name}
                onChange={handleChange}
              />
              {errors.name && <div className="form-error">{errors.name}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="mobileNumber">Mobile Number</label>
              <input
                type="tel"
                id="mobileNumber"
                name="mobileNumber"
                placeholder="01XXXXXXXXX"
                value={form.mobileNumber}
                onChange={handleChange}
              />
              {errors.mobileNumber && <div className="form-error">{errors.mobileNumber}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="transactionId">
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img src="/bkash-logo.svg" alt="bKash" style={{ width: '40px', height: 'auto' }} />
                  bKash Transaction ID
                </span>
              </label>
              <input
                type="text"
                id="transactionId"
                name="transactionId"
                placeholder="Enter your bKash Transaction ID"
                value={form.transactionId}
                onChange={handleChange}
              />
              {errors.transactionId && <div className="form-error">{errors.transactionId}</div>}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={submitting}
              style={{ width: '100%' }}
            >
              {submitting ? (
                <>
                  <span className="loading-spinner"></span> Submitting...
                </>
              ) : (
                '✍️ Submit Registration'
              )}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Registration fee: <strong style={{ color: 'var(--gold)' }}>৳ 1,000</strong> via bKash
          </p>
        </div>
      </div>
    </div>
  );
}
