import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function LandingPage() {
  const [bkashInfo, setBkashInfo] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [backendReady, setBackendReady] = useState(false);
  const [backendLoading, setBackendLoading] = useState(true);

  useEffect(() => {
    // Check backend health (handles Render cold start)
    const checkBackend = async () => {
      setBackendLoading(true);
      try {
        await api.checkHealth();
        setBackendReady(true);
        // Once backend is up, fetch bKash info
        try {
          const info = await api.getBkashInfo();
          setBkashInfo(info);
        } catch {
          setBkashInfo([{ adminName: 'Shahin', bkashNumber: '01712481019' }]);
        }
      } catch {
        // Backend not ready yet, retry after 5 seconds
        setTimeout(checkBackend, 5000);
      } finally {
        setBackendLoading(false);
      }
    };
    checkBackend();

    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div>
      {/* Navbar */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <Link to="/" className="navbar-brand">
            <img src="/logo.jpg" alt="Reunion Logo" />
            <span>Grand Reunion of Retired Gunners of VI</span>
          </Link>
          <button className="navbar-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? '✕' : '☰'}
          </button>
          <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
            <li><a href="#payment" onClick={() => setMenuOpen(false)}>Payment</a></li>
            <li><Link to="/register" onClick={() => setMenuOpen(false)}>Register</Link></li>
            <li><Link to="/admin/login" onClick={() => setMenuOpen(false)}>Admin</Link></li>
          </ul>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero" id="hero">
        <div className="hero-content">
          <img src="/logo.jpg" alt="Reunion Logo" className="hero-logo" />
          <p className="hero-subtitle">We Are Retired Gunners of VI</p>
          <h1>1st Grand Reunion<br />of Retirees — 2026</h1>
          <p className="hero-tagline">"Once a Gunner, Always a Gunner"</p>
          <div className="hero-date">
            🎖️ <span>November 13, 2026</span>
          </div>
          <div className="btn-group">
            <Link to="/register" className="btn btn-primary btn-lg">
              ✍️ Register Now
            </Link>
            <a href="#payment" className="btn btn-secondary btn-lg">
              💰 Payment Info
            </a>
          </div>
        </div>
      </section>

      {/* Payment & Registration Section */}
      <section className="section payment-section" id="payment">
        <div className="container">
          <h2 className="section-title">How to Register</h2>

          {/* 3 Steps */}
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">Step 1</div>
              <div className="step-title">Send Money via bKash</div>
              <div className="step-desc">৳ 1,530 to the number below</div>
            </div>
            <div className="step-card">
              <div className="step-number">Step 2</div>
              <div className="step-title">Submit Your Details</div>
              <div className="step-desc">Fill the registration form with TxnID</div>
            </div>
            <div className="step-card">
              <div className="step-number">Step 3</div>
              <div className="step-title">Get Confirmation</div>
              <div className="step-desc">You'll receive an SMS once verified</div>
            </div>
          </div>

          {/* bKash Info - only shows when backend is ready */}
          {backendLoading && !backendReady ? (
            <div className="backend-loading">
              <div className="spinner"></div>
              <p>Connecting to server...</p>
              <p className="loading-hint">First load may take 30–60 seconds</p>
            </div>
          ) : (
            <div className="bkash-section">
              {bkashInfo.map((info, idx) => (
                <div className="bkash-card-centered" key={idx}>
                  <img src="/bkash-logo.svg" alt="bKash" className="bkash-logo" />
                  <div className="bkash-label">Send Money</div>
                  <div className="bkash-name">{info.adminName}</div>
                  <div className="bkash-number">{info.bkashNumber}</div>
                  <div className="bkash-amount">৳ 1,530</div>
                </div>
              ))}
            </div>
          )}

          <div className="cta-center">
            <Link to="/register" className="btn btn-primary btn-lg">
              ✍️ Register & Submit Payment Details
            </Link>
          </div>
        </div>
      </section>

      {/* Organizer Section */}
      <section className="organizer-section">
        <div className="container">
          <div className="organizer-card">
            <div className="organizer-label">Head of Registration Organizer</div>
            <div className="organizer-name">Mokles Vai</div>
            <div className="organizer-phone">📞 01679783313</div>
            <div className="organizer-note">For any queries regarding the reunion</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>
            © 2026 <span className="footer-brand">1st Grand Reunion of Retirees</span>.
          </p>
        </div>
      </footer>
    </div>
  );
}
