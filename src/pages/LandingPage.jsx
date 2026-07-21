import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function LandingPage() {
  const [bkashInfo, setBkashInfo] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    api.getBkashInfo()
      .then(setBkashInfo)
      .catch(() => {
        // Fallback if API is not ready
        setBkashInfo([
          { adminName: 'Shahin', bkashNumber: '01712481019' },
        ]);
      });

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
            <span>Reunion 2026</span>
          </Link>
          <button className="navbar-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? '✕' : '☰'}
          </button>
          <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
            <li><a href="#about" onClick={() => setMenuOpen(false)}>About</a></li>
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

      {/* About Section */}
      <section className="section about-section" id="about">
        <div className="container">
          <div className="about-grid">
            <div className="about-content">
              <h2>About The Reunion</h2>
              <p>
                After years of dedicated service to the nation, we — the retired gunners 
                of VI Artillery — are coming together for our very first Grand Reunion in 2026.
              </p>
              <p>
                This is a celebration of brotherhood, camaraderie, and the bonds forged 
                in service. Whether you served for years or decades, this reunion is for you.
              </p>
            </div>
            <ul className="about-features">
              <li>
                <span className="feature-icon">🎯</span>
                <span className="feature-text">Reconnect with your fellow gunners and comrades</span>
              </li>
              <li>
                <span className="feature-icon">🎖️</span>
                <span className="feature-text">Celebrate our shared service and memories</span>
              </li>
              <li>
                <span className="feature-icon">🤝</span>
                <span className="feature-text">Strengthen the bond of brotherhood forever</span>
              </li>
              <li>
                <span className="feature-icon">🎉</span>
                <span className="feature-text">A grand event with dinner, awards & entertainment</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Payment Section */}
      <section className="section payment-section" id="payment">
        <div className="container">
          <h2>Payment Information</h2>
          <p className="section-desc">
            Use bKash <strong>"Send Money"</strong> to the following number 
            and then submit your details through our registration form.
          </p>

          <div className="payment-amount">
            <div>
              <div className="amount-label">Registration Fee</div>
              <div className="amount">৳ 1,530</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--gold)', marginTop: '4px' }}>via bKash Send Money</div>
            </div>
          </div>

          <div className="bkash-cards">
            {bkashInfo.map((info, idx) => (
              <div className="bkash-card" key={idx}>
                <img src="/bkash-logo.svg" alt="bKash" className="bkash-logo" />
                <div style={{ fontSize: '0.7rem', color: 'var(--gold)', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>Send Money</div>
                <div className="bkash-name">{info.adminName}</div>
                <div className="bkash-number">{info.bkashNumber}</div>
              </div>
            ))}
          </div>

          <div className="btn-group">
            <Link to="/register" className="btn btn-primary btn-lg">
              ✍️ Submit Payment Details
            </Link>
          </div>
        </div>
      </section>

      {/* Organizer Section */}
      <section className="section" style={{ paddingBottom: '2rem' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(201, 168, 76, 0.08), rgba(201, 168, 76, 0.02))',
            border: '1px solid rgba(201, 168, 76, 0.25)',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '480px',
            margin: '0 auto',
          }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--gold)', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Head of Reunion Arrangement
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
              Mokles
            </div>
            <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              📞 01679783313
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontStyle: 'italic' }}>
              For any queries regarding the reunion, please contact
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>
            © 2026 <span className="footer-brand">1st Grand Reunion of Retirees</span>. 
            Organized by Mokles.
          </p>
        </div>
      </footer>
    </div>
  );
}
