import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const GOOGLE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/google`;

function MarketingPanel() {
  return (
    <div className="auth-marketing">
      <div className="auth-marketing-inner">
        <div className="auth-marketing-eyebrow">Join the Movement</div>
        <h2 className="auth-marketing-headline">
          Your idea deserves to be heard.
        </h2>
        <ul className="auth-marketing-bullets">
          <li>
            <span className="auth-bullet-check">✓</span>
            <span>Share your startup pitch in minutes — no lengthy forms</span>
          </li>
          <li>
            <span className="auth-bullet-check">✓</span>
            <span>Get real, structured feedback from a global community of builders</span>
          </li>
          <li>
            <span className="auth-bullet-check">✓</span>
            <span>Pressure-test your idea before you spend a single dollar building it</span>
          </li>
        </ul>
        <div className="auth-marketing-divider" />
        <div className="auth-marketing-stat">
          <span className="auth-stat-number">100% Free</span>
          <span className="auth-stat-label">No fees. No gatekeepers. Just ideas.</span>
        </div>
      </div>
    </div>
  );
}

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await api.post('/api/auth/register', form);
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-split">
      <div className="auth-split-form">
        <div className="auth-split-inner">
          <div className="form-eyebrow">Join PitchDeck</div>
          <h1>Create your account</h1>
          <p className="form-subtitle">Share your startup idea and get real feedback from builders.</p>

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

          <div className="form-divider">or sign up with email</div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input name="name" required placeholder="e.g. Francis Ani" value={form.name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" name="email" required placeholder="you@example.com" value={form.email} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" required placeholder="Min. 8 characters" value={form.password} onChange={handleChange} />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>

          <div className="form-footer">
            Already have an account? <Link to="/login">Log in</Link>
          </div>
        </div>
      </div>

      <MarketingPanel />
    </div>
  );
}
