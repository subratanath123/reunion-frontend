import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import LandingPage from './pages/LandingPage';
import PaymentForm from './pages/PaymentForm';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const [isPlaying, setIsPlaying] = useState(true);
  const audioRef = useRef(null);

  useEffect(() => {
    const tryAutoplay = () => {
      if (audioRef.current) {
        audioRef.current.play().catch(() => {
          setIsPlaying(false);
          const playOnInteraction = () => {
            if (audioRef.current) {
              audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
            }
          };
          document.addEventListener('click', playOnInteraction, { once: true });
          document.addEventListener('touchstart', playOnInteraction, { once: true });
        });
      }
    };
    tryAutoplay();
  }, []);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <>
      {/* Global Background Music */}
      <audio ref={audioRef} loop preload="auto">
        <source src="/Durgom Giri Kantar (music.com.bd).mp3" type="audio/mpeg" />
      </audio>

      {/* Global Floating Music Button */}
      <button
        onClick={toggleMusic}
        className={`music-btn ${isPlaying ? 'playing' : ''}`}
        title={isPlaying ? 'Pause Music' : 'Play: দুর্গম গিরি কান্তার মরু'}
        aria-label="Toggle music"
      >
        {isPlaying ? '⏸️' : '🎵'}
        <span className="music-label">{isPlaying ? 'Pause' : 'Play'}</span>
      </button>

      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<PaymentForm />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
