import { useState, useEffect } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const GOOGLE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/google`;

const GoogleSVG = () => (
  <svg width="18" height="18" viewBox="0 0 18 18">
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/>
    <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"/>
  </svg>
);

const CONTENT = {
  founder: {
    register: {
      eyebrow: 'Join as a Founder',
      title: 'Launch your pitch',
      subtitle: 'Share your startup idea and get structured feedback from real builders worldwide.',
      divider: 'or sign up with email',
      cta: 'Create Founder Account →',
      ctaLoading: 'Creating account...',
      toggle: <p>Already have an account? <Link to="/founder/login">Log in as Founder</Link></p>,
      panel: {
        eyebrow: 'For Founders',
        headline: 'Stop keeping your idea in a notes app.',
        bullets: [
          'Post your startup pitch in minutes — no lengthy forms',
          'Get structured, honest feedback from builders worldwide',
          'Pressure-test your idea before you spend a dollar building it',
        ],
        stat: { number: '100% Free', label: 'No fees. No gatekeepers. Just ideas.' },
      },
    },
    login: {
      eyebrow: 'Founder Login',
      title: 'Welcome back',
      subtitle: 'Log in to manage your pitches and read your latest feedback.',
      divider: 'or log in with email',
      cta: 'Log In as Founder →',
      ctaLoading: 'Logging in...',
      toggle: <p>No account yet? <Link to="/founder/register">Sign up as a Founder</Link></p>,
      panel: {
        eyebrow: 'For Founders',
        headline: 'Your next pitch is one post away.',
        bullets: [
          'See all the feedback your pitches have received',
          'Edit and refine your idea based on community input',
          'Track how your concept resonates with real builders',
        ],
        stat: { number: '20+ Pitches', label: 'Live on the platform right now.' },
      },
    },
  },
  builder: {
    register: {
      eyebrow: 'Join as a Builder',
      title: 'Find ideas worth building',
      subtitle: 'Discover early-stage startups, share your expertise, and leave feedback that shapes real products.',
      divider: 'or sign up with email',
      cta: 'Create Builder Account →',
      ctaLoading: 'Creating account...',
      toggle: <p>Already have an account? <Link to="/builder/login">Log in as Builder</Link></p>,
      panel: {
        eyebrow: 'For Builders',
        headline: "Find your next project before it's built.",
        bullets: [
          'Browse early-stage pitches from founders worldwide',
          'Share expert feedback and directly shape real products',
          'Discover problems worth solving before anyone else does',
        ],
        stat: { number: '100% Free', label: 'No fees. No gatekeepers. Just ideas.' },
      },
    },
    login: {
      eyebrow: 'Builder Login',
      title: 'Welcome back',
      subtitle: 'Log in to discover new pitches and continue giving feedback.',
      divider: 'or log in with email',
      cta: 'Log In as Builder →',
      ctaLoading: 'Logging in...',
      toggle: <p>No account yet? <Link to="/builder/register">Sign up as a Builder</Link></p>,
      panel: {
        eyebrow: 'For Builders',
        headline: 'Good builders shape great ideas.',
        bullets: [
          'Review the latest pitches from founders around the world',
          'Give structured feedback that actually helps founders improve',
          'Spot the problems worth solving before anyone else does',
        ],
        stat: { number: '100+', label: 'Feedback entries shared so far.' },
      },
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

export default function AuthPage({ role, mode }) {
  const { user, loading: authLoading, login: loginUser } = useAuth();
  const navigate = useNavigate();
  const isRegister = mode === 'register';
  const content = CONTENT[role][mode];

  const [form, setForm] = useState(
    isRegister ? { name: '', email: '', password: '' } : { email: '', password: '' }
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Already logged in — send straight to feed
  if (!authLoading && user) return <Navigate to="/" replace />;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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
      setError(err.response?.data?.error || `${isRegister ? 'Registration' : 'Login'} failed.`);
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-split">
      <div className="auth-split-form">
        <div className="auth-split-inner">
          <div className={`auth-role-badge auth-role-${role}`}>{role === 'founder' ? '🚀 Founder' : '🔧 Builder'}</div>
          <div className="form-eyebrow">{content.eyebrow}</div>
          <h1>{content.title}</h1>
          <p className="form-subtitle">{content.subtitle}</p>

          {error && <div className="alert alert-error">{error}</div>}

          <a href={GOOGLE_URL} className="btn-google">
            <GoogleSVG />
            Continue with Google
          </a>

          <div className="form-divider">{content.divider}</div>

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
              {loading ? content.ctaLoading : content.cta}
            </button>
          </form>

          <div className="form-footer">{content.toggle}</div>
          <div className="form-footer" style={{ marginTop: '0.5rem' }}>
            {role === 'founder'
              ? <><Link to="/builder/login">Switch to Builder login</Link></>
              : <><Link to="/founder/login">Switch to Founder login</Link></>
            }
          </div>
        </div>
      </div>
      <MarketingPanel content={content.panel} />
    </div>
  );
}
