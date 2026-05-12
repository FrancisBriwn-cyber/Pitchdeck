import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const GOOGLE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/google`;

function MarketingPanel() {
  return (
    <div className="auth-marketing">
      <div className="auth-marketing-inner">
        <div className="auth-marketing-eyebrow">For Founders &amp; Builders</div>
        <h2 className="auth-marketing-headline">
          Where bold ideas meet honest feedback.
        </h2>
        <ul className="auth-marketing-bullets">
          <li>
            <span className="auth-bullet-check">✓</span>
            <span>Post your startup pitch and get discovered by builders worldwide</span>
          </li>
          <li>
            <span className="auth-bullet-check">✓</span>
            <span>Receive structured, honest feedback from a real community</span>
          </li>
          <li>
            <span className="auth-bullet-check">✓</span>
            <span>Discover what problems other people are actually trying to solve</span>
          </li>
        </ul>
        <div className="auth-marketing-divider" />
        <div className="auth-marketing-stat">
          <span className="auth-stat-number">20+ Pitches</span>
          <span className="auth-stat-label">Live on the platform. More added every day.</span>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await api.post('/api/auth/login', form);
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-split">
      <div className="auth-split-form">
        <div className="auth-split-inner">
          <div className="form-eyebrow">Welcome back</div>
          <h1>Log in to PitchDeck</h1>
          <p className="form-subtitle">Continue sharing and discovering startup ideas.</p>

          {error && <div className="alert alert-error">{error}</div>}

          <a href={GOOGLE_URL} className="btn-google">
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/>
              <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
            Continue with Google
          </a>

          <div className="form-divider">or log in with email</div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" name="email" required placeholder="you@example.com" value={form.email} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" required placeholder="Your password" value={form.password} onChange={handleChange} />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Log In →'}
            </button>
          </form>

          <div className="form-footer">
            No account yet? <Link to="/register">Sign up free</Link>
          </div>
        </div>
      </div>

      <MarketingPanel />
    </div>
  );
}
