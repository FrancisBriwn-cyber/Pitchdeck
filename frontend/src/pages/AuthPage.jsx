import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Rocket, Wrench } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const GOOGLE_URL = `${API_BASE}/api/auth/google`;
const GITHUB_URL = `${API_BASE}/api/auth/github`;

const GoogleSVG = () => (
  <svg width="18" height="18" viewBox="0 0 18 18">
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/>
    <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"/>
  </svg>
);

const GitHubSVG = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);

const PANEL = {
  founder: {
    login: {
      eyebrow: 'For Founders',
      headline: 'Your community is waiting.',
      bullets: [
        'See every piece of feedback your pitches have collected',
        'Sharpen your idea based on input from people who actually build',
        'Track which parts of your pitch land — and which fall flat',
      ],
      stat: { number: '20+ Pitches', label: 'Live on the platform right now.' },
    },
    register: {
      eyebrow: 'For Founders',
      headline: 'Stop keeping your idea in a notes app.',
      bullets: [
        'Post your pitch in under 5 minutes — no deck required',
        'Get honest feedback from builders who know what ships',
        'Find out if your idea has legs before you write a single line of code',
      ],
      stat: { number: '100% Free', label: 'No fees. No gatekeepers. Just ideas.' },
    },
  },
  builder: {
    login: {
      eyebrow: 'For Builders',
      headline: 'Good builders shape great ideas.',
      bullets: [
        'See what founders have posted since your last visit',
        'Leave feedback that actually moves an idea forward',
        'Spot the next interesting problem before it becomes obvious',
      ],
      stat: { number: '100+', label: 'Feedback entries shared so far.' },
    },
    register: {
      eyebrow: 'For Builders',
      headline: "Find your next project before it's built.",
      bullets: [
        'Browse raw, early-stage ideas from founders worldwide',
        'Give the kind of feedback friends won\'t — honest and specific',
        'Spot problems worth solving while everyone else is still asleep',
      ],
      stat: { number: '100% Free', label: 'No fees. No gatekeepers. Just ideas.' },
    },
  },
};

function MarketingPanel({ content }) {
  return (
    <div className="auth-marketing">
      <div className="auth-marketing-inner">
        <div className="auth-marketing-eyebrow">{content.eyebrow}</div>
        <h2 className="auth-marketing-headline">{content.headline}</h2>
        <ul className="auth-marketing-bullets">
          {content.bullets.map((b, i) => (
            <li key={i}>
              <span className="auth-bullet-check">✓</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
        <div className="auth-marketing-divider" />
        <div className="auth-marketing-stat">
          <span className="auth-stat-number">{content.stat.number}</span>
          <span className="auth-stat-label">{content.stat.label}</span>
        </div>
      </div>
    </div>
  );
}

// role prop is optional — omitting it enables the built-in role tab switcher
export default function AuthPage({ role: roleProp, mode }) {
  const { user, loading: authLoading, login: loginUser } = useAuth();
  const navigate = useNavigate();
  const isRegister = mode === 'register';
  const unified = !roleProp;

  const [role, setRole] = useState(roleProp ?? 'founder');
  const [form, setForm] = useState(
    isRegister ? { name: '', email: '', password: '' } : { email: '', password: '' }
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!authLoading && user) return <Navigate to="/" replace />;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const switchRole = (next) => {
    setRole(next);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const payload = isRegister ? { ...form, role } : form;
      const res = await api.post(endpoint, payload);
      loginUser(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  const panel = PANEL[role][mode];

  return (
    <div className="auth-split">
      <div className="auth-split-form">
        <div className="auth-split-inner">

          {/* Role tab switcher — shown only on unified routes */}
          {unified ? (
            <div className="auth-role-tabs">
              <button
                className={`auth-role-tab ${role === 'founder' ? 'auth-role-tab-active' : ''}`}
                onClick={() => switchRole('founder')}
                type="button"
              >
                <Rocket size={14} /> Founder
              </button>
              <button
                className={`auth-role-tab ${role === 'builder' ? 'auth-role-tab-active' : ''}`}
                onClick={() => switchRole('builder')}
                type="button"
              >
                <Wrench size={14} /> Builder
              </button>
            </div>
          ) : (
            <div className={`auth-role-badge auth-role-${role}`}>
              {role === 'founder' ? <><Rocket size={13} /> Founder</> : <><Wrench size={13} /> Builder</>}
            </div>
          )}

          <h1>{isRegister ? (role === 'founder' ? 'Launch your pitch' : 'Find ideas worth building') : 'Welcome back'}</h1>
          <p className="form-subtitle">
            {isRegister
              ? role === 'founder'
                ? 'Post your pitch and get honest feedback from builders who know what works.'
                : 'Browse early-stage pitches and share expertise that actually helps founders ship.'
              : role === 'founder'
                ? 'Welcome back — your latest feedback is waiting.'
                : 'Welcome back — new pitches have been posted since you were last here.'
            }
          </p>

          {error && <div className="alert alert-error">{error}</div>}

          <div className="oauth-row">
            <a href={GOOGLE_URL} className="btn-google">
              <GoogleSVG />
              Google
            </a>
            <a href={GITHUB_URL} className="btn-github">
              <GitHubSVG />
              GitHub
            </a>
          </div>

          <div className="form-divider">{isRegister ? 'or sign up with email' : 'or log in with email'}</div>

          <form onSubmit={handleSubmit}>
            {isRegister && (
              <div className="form-group">
                <label>Full Name</label>
                <input name="name" required placeholder="e.g. Francis Ani" value={form.name} onChange={handleChange} />
              </div>
            )}
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" name="email" required placeholder="you@example.com" value={form.email} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" required placeholder={isRegister ? 'Min. 8 characters' : 'Your password'} value={form.password} onChange={handleChange} />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading
                ? isRegister ? 'Creating account...' : 'Logging in...'
                : isRegister ? 'Create Account →' : 'Log In →'}
            </button>
          </form>

          <div className="form-footer">
            {isRegister
              ? <p>Already have an account? <Link to="/login">Log in</Link></p>
              : <p>No account yet? <Link to="/register">Sign up</Link></p>
            }
          </div>

        </div>
      </div>
      <MarketingPanel content={panel} />
    </div>
  );
}
