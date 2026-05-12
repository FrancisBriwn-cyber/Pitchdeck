import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export default function Navbar() {
  const { user, logout } = useAuth();
  const [query, setQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setMobileOpen(false);
    }
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">

        <Link to="/" className="navbar-brand">
          Pitch<span>Deck</span>
        </Link>

        {!user && (
          <div className="navbar-audience">
            <a href="/#pitches" className="navbar-audience-pill">Browse Pitches</a>
            <a href="/#how-it-works" className="navbar-audience-pill">How it works</a>
          </div>
        )}

        {user && (
          <>
            <div className="navbar-divider" />
            <div className="navbar-search">
              <form onSubmit={handleSearch} className="navbar-search-pill">
                <SearchIcon />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search pitches, ideas, markets..."
                />
                <button type="submit" className="navbar-search-btn">Search</button>
              </form>
            </div>
          </>
        )}

        <div className="navbar-links">
          {user ? (
            <>
              <Link to="/pitches/new" className="btn btn-primary btn-cta">+ New Pitch</Link>
              <Link to={`/users/${user.id}`} className="navbar-avatar" title={user.name}>
                {user.name ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) : '?'}
              </Link>
              <button className="btn btn-outline" onClick={() => { logout(); navigate('/'); }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/join" className="btn btn-outline">Log in</Link>
              <Link to="/join" className="btn btn-primary btn-cta">Sign up</Link>
            </>
          )}
        </div>

        {/* Hamburger toggle */}
        <button
          className="navbar-hamburger"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <span style={mobileOpen ? { transform: 'rotate(45deg) translate(5px, 5px)' } : {}} />
          <span style={mobileOpen ? { opacity: 0 } : {}} />
          <span style={mobileOpen ? { transform: 'rotate(-45deg) translate(5px, -5px)' } : {}} />
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="navbar-mobile-menu">
          <form onSubmit={handleSearch} className="navbar-mobile-search">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pitches..."
            />
            <button type="submit">Search</button>
          </form>

          <div className="navbar-mobile-links">
            {user ? (
              <>
                <Link to="/pitches/new" onClick={() => setMobileOpen(false)}>+ New Pitch</Link>
                <Link to={`/users/${user.id}`} onClick={() => setMobileOpen(false)}>My Profile</Link>
                <button onClick={() => { logout(); setMobileOpen(false); navigate('/'); }}>Logout</button>
              </>
            ) : (
              <>
                <a href="/#pitches" onClick={() => setMobileOpen(false)}>Browse Pitches</a>
                <a href="/#how-it-works" onClick={() => setMobileOpen(false)}>How it works</a>
                <Link to="/join" onClick={() => setMobileOpen(false)}>Log in</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
