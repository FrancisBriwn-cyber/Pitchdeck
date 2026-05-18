import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [query, setQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Poll notifications every 30 s while logged in
  useEffect(() => {
    if (!user) return;
    const fetchNotifs = async () => {
      try {
        const res = await api.get('/api/notifications');
        setNotifications(res.data);
      } catch {}
    };
    fetchNotifs();
    const id = setInterval(fetchNotifs, 30000);
    return () => clearInterval(id);
  }, [user]);

  const markAllRead = async () => {
    try {
      await api.patch('/api/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {}
  };

  const handleNotifToggle = () => {
    const opening = !notifOpen;
    setNotifOpen(opening);
    if (opening && unreadCount > 0) markAllRead();
  };

  // Close notif dropdown on outside click
  useEffect(() => {
    if (!notifOpen) return;
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [notifOpen]);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
      navigate('/');
    }
  };

  useEffect(() => {
    if (!searchOpen) return;
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [searchOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery('');
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
            <div className="navbar-search-wrap" ref={searchRef}>
              {searchOpen ? (
                <form onSubmit={handleSearch} className="navbar-search-pill">
                  <SearchIcon />
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search pitches..."
                    onKeyDown={(e) => { if (e.key === 'Escape') { setSearchOpen(false); setQuery(''); } }}
                  />
                  <button type="submit" className="navbar-search-btn">Search</button>
                </form>
              ) : (
                <button className="navbar-search-toggle" onClick={() => setSearchOpen(true)} aria-label="Open search">
                  <SearchIcon />
                  <span>Search</span>
                </button>
              )}
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
              <button className="btn btn-outline" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-primary">Log in</Link>
              <Link to="/register" className="btn btn-primary btn-cta">Sign up</Link>
            </>
          )}
        </div>

        {/* Notification bell — logged-in users only */}
        {user && (
          <div className="notif-wrap" ref={notifRef}>
            <button className="notif-btn" onClick={handleNotifToggle} aria-label="Notifications">
              <Bell size={17} />
              {unreadCount > 0 && (
                <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </button>

            {notifOpen && (
              <div className="notif-dropdown">
                <div className="notif-dropdown-header">
                  <span>Notifications</span>
                </div>
                {notifications.length === 0 ? (
                  <div className="notif-empty">No notifications yet</div>
                ) : (
                  notifications.map((n) => (
                    <Link
                      key={n.id}
                      to={`/pitches/${n.pitch_id}`}
                      className={`notif-item${n.is_read ? '' : ' unread'}`}
                      onClick={() => setNotifOpen(false)}
                    >
                      <div className="notif-item-text">
                        <strong>{n.actor_name}</strong> reviewed &ldquo;{n.pitch_name}&rdquo;
                      </div>
                      <div className="notif-item-time">{timeAgo(n.created_at)}</div>
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Theme toggle — always visible */}
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

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
                <button onClick={() => { setMobileOpen(false); handleLogout(); }}>Logout</button>
              </>
            ) : (
              <>
                <a href="/#pitches" onClick={() => setMobileOpen(false)}>Browse Pitches</a>
                <a href="/#how-it-works" onClick={() => setMobileOpen(false)}>How it works</a>
                <Link to="/login" onClick={() => setMobileOpen(false)}>Log in</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
