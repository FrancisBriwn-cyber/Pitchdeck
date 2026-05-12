import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Lightbulb, Hammer, Rocket, TrendingUp, MessageSquare, Users, DollarSign, Wrench, FlaskConical, Compass } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const GOOGLE_URL = `${API_BASE}/api/auth/google`;
const GITHUB_URL  = `${API_BASE}/api/auth/github`;

const STAGES = [
  { value: 'idea',     icon: <Lightbulb size={18} />, label: 'Just an Idea',   desc: 'I have a concept but nothing built yet' },
  { value: 'mvp',      icon: <Hammer size={18} />,    label: 'Building MVP',   desc: 'Actively developing the product' },
  { value: 'launched', icon: <Rocket size={18} />,    label: 'Launched',       desc: 'Live with real users' },
  { value: 'traction', icon: <TrendingUp size={18} />,label: 'Early Traction', desc: 'Growing users or revenue' },
];

const INDUSTRIES = [
  'Fintech', 'Healthtech', 'Edtech', 'Agritech', 'Logistics',
  'Real Estate', 'Food & Nutrition', 'Talent & Work', 'Clean Energy',
  'E-commerce', 'Developer Tools', 'Social Impact', 'Other',
];

const TEAM_SIZES = [
  { value: 'solo',   label: 'Solo Founder' },
  { value: '2-3',    label: '2 – 3 people' },
  { value: '4-10',   label: '4 – 10 people' },
  { value: '10+',    label: '10+ people' },
];

const LOOKING_FOR = [
  { value: 'feedback',  icon: <MessageSquare size={14} />, label: 'Honest feedback' },
  { value: 'cofounder', icon: <Users size={14} />,         label: 'Co-founder' },
  { value: 'investors', icon: <DollarSign size={14} />,    label: 'Investors / Angels' },
  { value: 'builders',  icon: <Wrench size={14} />,        label: 'Builders to join' },
  { value: 'beta',      icon: <FlaskConical size={14} />,  label: 'Beta testers' },
  { value: 'mentors',   icon: <Compass size={14} />,       label: 'Mentors / Advisors' },
];

function MarketingPanel({ step }) {
  return (
    <div className="auth-marketing">
      <div className="auth-marketing-inner">
        <div className="auth-marketing-eyebrow">For Founders</div>
        <h2 className="auth-marketing-headline">
          {step === 1 ? 'Stop keeping your idea in a notes app.' : 'Tell us about your journey.'}
        </h2>
        <ul className="auth-marketing-bullets">
          <li><span className="auth-bullet-check">✓</span><span>Post your pitch in minutes — no investor deck needed</span></li>
          <li><span className="auth-bullet-check">✓</span><span>Hear what builders actually think, not what friends politely say</span></li>
          <li><span className="auth-bullet-check">✓</span><span>Know if your idea has legs before you commit to building it</span></li>
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

export default function FounderRegister() {
  const { user, loading: authLoading, login: loginUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    bio: '', stage: '', industry: '', team_size: '',
    location: '', linkedin_url: '', looking_for: [],
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!authLoading && user) return <Navigate to="/" replace />;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleLooking = (value) => {
    setForm((prev) => ({
      ...prev,
      looking_for: prev.looking_for.includes(value)
        ? prev.looking_for.filter((v) => v !== value)
        : [...prev.looking_for, value],
    }));
  };

  const handleStep1 = (e) => {
    e.preventDefault();
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.stage) { setError('Please select your startup stage.'); return; }
    if (!form.industry) { setError('Please select your industry.'); return; }
    setError(''); setLoading(true);
    try {
      const res = await api.post('/api/auth/register', {
        ...form,
        role: 'founder',
        looking_for: form.looking_for.join(','),
      });
      loginUser(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.message);
      if (err.response?.status === 400) setStep(1);
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-split">
      <div className="auth-split-form">
        <div className="auth-split-inner founder-wide">

          {/* Progress */}
          <div className="founder-progress">
            <div className="founder-progress-bar">
              <div className="founder-progress-fill" style={{ width: step === 1 ? '50%' : '100%' }} />
            </div>
            <span className="founder-progress-label">Step {step} of 2</span>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          {/* ── STEP 1: Account ── */}
          {step === 1 && (
            <>
              <div className="auth-role-badge auth-role-founder"><Rocket size={13} /> Founder</div>
              <div className="form-eyebrow">Create Your Account</div>
              <h1>Join as a Founder</h1>
              <p className="form-subtitle">Create an account to start sharing your idea with builders worldwide.</p>

              <div className="oauth-row">
                <a href={GOOGLE_URL} className="btn-google">
                  <svg width="18" height="18" viewBox="0 0 18 18">
                    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/>
                    <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
                    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"/>
                  </svg>
                  Google
                </a>
                <a href={GITHUB_URL} className="btn-github">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  GitHub
                </a>
              </div>

              <div className="form-divider">or sign up with email</div>

              <form onSubmit={handleStep1}>
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
                  <input type="password" name="password" required minLength={8} placeholder="Min. 8 characters" value={form.password} onChange={handleChange} />
                </div>
                <button type="submit" className="btn btn-primary btn-full">Continue → Founder Profile</button>
              </form>

              <div className="form-footer">Already have an account? <Link to="/founder/login">Log in</Link></div>
            </>
          )}

          {/* ── STEP 2: Founder Profile ── */}
          {step === 2 && (
            <>
              <div className="auth-role-badge auth-role-founder"><Rocket size={13} /> Founder Profile</div>
              <div className="form-eyebrow">Almost there</div>
              <h1>Tell us about your startup</h1>
              <p className="form-subtitle">This helps the community give you more relevant feedback.</p>

              <form onSubmit={handleSubmit}>

                {/* Stage */}
                <div className="form-group">
                  <label>What stage is your startup? <span className="required-star">*</span></label>
                  <div className="stage-cards">
                    {STAGES.map((s) => (
                      <button
                        key={s.value}
                        type="button"
                        className={`stage-card ${form.stage === s.value ? 'stage-card-active' : ''}`}
                        onClick={() => setForm({ ...form, stage: s.value })}
                      >
                        <span className="stage-card-icon">{s.icon}</span>
                        <span className="stage-card-label">{s.label}</span>
                        <span className="stage-card-desc">{s.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Industry */}
                <div className="form-group">
                  <label>Industry / Domain <span className="required-star">*</span></label>
                  <select name="industry" value={form.industry} onChange={handleChange} required>
                    <option value="">Select your industry...</option>
                    {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>

                {/* Team size */}
                <div className="form-group">
                  <label>Team Size</label>
                  <div className="pill-group">
                    {TEAM_SIZES.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        className={`pill-option ${form.team_size === t.value ? 'pill-option-active' : ''}`}
                        onClick={() => setForm({ ...form, team_size: t.value })}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Looking for */}
                <div className="form-group">
                  <label>What are you looking for? <span className="form-label-hint">(pick all that apply)</span></label>
                  <div className="pill-group">
                    {LOOKING_FOR.map((l) => (
                      <button
                        key={l.value}
                        type="button"
                        className={`pill-option ${form.looking_for.includes(l.value) ? 'pill-option-active' : ''}`}
                        onClick={() => toggleLooking(l.value)}
                      >
                        {l.icon} {l.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location */}
                <div className="form-group">
                  <label>Where are you based?</label>
                  <input name="location" placeholder="e.g. Lagos, Nigeria" value={form.location} onChange={handleChange} />
                </div>

                {/* Bio */}
                <div className="form-group">
                  <label>Short Bio <span className="form-label-hint">(optional)</span></label>
                  <textarea
                    name="bio"
                    placeholder="Tell the community a little about yourself and what you're building..."
                    value={form.bio}
                    onChange={handleChange}
                    style={{ minHeight: '80px' }}
                    maxLength={300}
                  />
                  <span className="char-count">{form.bio.length}/300</span>
                </div>

                {/* LinkedIn */}
                <div className="form-group">
                  <label>LinkedIn URL <span className="form-label-hint">(optional)</span></label>
                  <input name="linkedin_url" type="url" placeholder="https://linkedin.com/in/yourprofile" value={form.linkedin_url} onChange={handleChange} />
                </div>

                <div className="founder-form-actions">
                  <button type="button" className="btn btn-outline-dark" onClick={() => setStep(1)}>← Back</button>
                  <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
                    {loading ? 'Creating your account...' : 'Create Founder Account →'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>

      <MarketingPanel step={step} />
    </div>
  );
}
