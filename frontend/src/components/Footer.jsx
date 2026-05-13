import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Footer() {
  const { user } = useAuth();
  const year = new Date().getFullYear();

  return (
    <footer className="footer">

      {/* ── Brand + CTA ── */}
      <div className="footer-top">
        <div className="container footer-top-inner">
          <div>
            <Link to="/" className="footer-logo">Pitch<span>Deck</span></Link>
            <p className="footer-tagline">Where bold ideas meet honest feedback.</p>
          </div>
          <Link
            to={user ? '/pitches/new' : '/founder/register'}
            className="btn btn-primary footer-cta-btn"
          >
            Post a Pitch →
          </Link>
        </div>
      </div>

      {/* ── Link columns ── */}
      <div className="footer-links-row container">
        <div className="footer-links">
          <p className="footer-links-heading">Explore</p>
          <Link to="/">Browse Feed</Link>
          <Link to="/search">Search Pitches</Link>
          <Link to="/pitches/new">Submit a Pitch</Link>
        </div>

        <div className="footer-links">
          <p className="footer-links-heading">For Founders</p>
          <Link to="/founder/register">Create Account</Link>
          <Link to="/pitches/new">Post a Pitch</Link>
          <Link to="/join">Log In</Link>
        </div>

        <div className="footer-links">
          <p className="footer-links-heading">For Builders</p>
          <Link to="/builder/register">Create Account</Link>
          <Link to="/">Give Feedback</Link>
          <Link to="/search">Discover Ideas</Link>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <div className="footer-bottom-left">
            <span className="footer-status-dot" />
            <span>© {year} PitchDeck.</span>
            <span className="footer-bottom-stats">20+ pitches · 100+ feedback · Always free</span>
          </div>
          <span className="footer-built">Built with care</span>
        </div>
      </div>

    </footer>
  );
}
