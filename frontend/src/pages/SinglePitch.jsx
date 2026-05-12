import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const getInitials = (name = '') =>
  name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export default function SinglePitch() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [pitch, setPitch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState({ what_i_like: '', would_change: '', would_use: true });
  const [fbError, setFbError] = useState('');
  const [fbSuccess, setFbSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPitch = () =>
    api.get(`/api/pitches/${id}`)
      .then((res) => setPitch(res.data))
      .catch(() => setError('Pitch not found.'))
      .finally(() => setLoading(false));

  useEffect(() => { fetchPitch(); }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this pitch? This cannot be undone.')) return;
    await api.delete(`/api/pitches/${id}`);
    navigate('/');
  };

  const handleFeedback = async (e) => {
    e.preventDefault();
    setFbError(''); setFbSuccess(''); setSubmitting(true);
    try {
      await api.post(`/api/pitches/${id}/feedback`, feedback);
      setFbSuccess('Your feedback has been submitted!');
      setFeedback({ what_i_like: '', would_change: '', would_use: true });
      fetchPitch();
    } catch (err) {
      setFbError(err.response?.data?.error || 'Failed to submit feedback.');
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="loading"><div className="spinner" /> Loading pitch...</div>;
  if (error) return <div className="alert alert-error container page">{error}</div>;

  const isOwner = user && user.id === pitch.user_id;
  const alreadyReviewed = user && pitch.feedback.some((f) => f.user_id === user.id);
  const wouldUseCount = pitch.feedback.filter((f) => f.would_use).length;
  const wouldUsePct = pitch.feedback.length
    ? Math.round((wouldUseCount / pitch.feedback.length) * 100)
    : null;

  return (
    <>
      {/* ── Back bar ── */}
      <div className="sp-back-bar">
        <div className="container">
          <button className="sp-back" onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div>
      </div>

      {/* ── Hero ── */}
      <div className="sp-hero" style={pitch.cover_image_url ? { backgroundImage: `url(${pitch.cover_image_url})` } : {}}>
        <div className={`sp-hero-overlay ${!pitch.cover_image_url ? 'sp-hero-overlay-solid' : ''}`} />
        <div className="container sp-hero-content">
          <div className="sp-hero-eyebrow">{pitch.target_market.split(' ').slice(-3).join(' ')}</div>
          <h1 className="sp-hero-title">{pitch.name}</h1>
          <p className="sp-hero-oneliner">{pitch.one_liner}</p>
          <div className="sp-hero-meta">
            <div className="sp-hero-author">
              <div className="author-avatar" style={{ background: 'rgba(255,255,255,.15)', color: '#fff', border: '1px solid rgba(255,255,255,.2)' }}>
                {getInitials(pitch.author_name)}
              </div>
              <div>
                <Link to={`/users/${pitch.user_id}`} className="sp-author-link">{pitch.author_name}</Link>
                <div className="sp-hero-date">{formatDate(pitch.created_at)}</div>
              </div>
            </div>
            <div className="sp-hero-badges">
              <span className="sp-badge">💬 {pitch.feedback.length} feedback</span>
              {wouldUsePct !== null && (
                <span className="sp-badge sp-badge-green">👍 {wouldUsePct}% would use</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="container sp-body">
        <div className="sp-layout">

          {/* Main content */}
          <main className="sp-main">

            {/* Owner actions */}
            {isOwner && (
              <div className="sp-owner-bar">
                <span className="sp-owner-label">Your pitch</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link to={`/pitches/${id}/edit`} className="btn btn-outline-dark">Edit</Link>
                  <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
                </div>
              </div>
            )}

            {/* Pitch sections */}
            <div className="sp-sections">
              <div className="sp-section">
                <div className="sp-section-label">🔥 The Problem</div>
                <p className="sp-section-text">{pitch.problem}</p>
              </div>
              <div className="sp-section">
                <div className="sp-section-label">💡 The Solution</div>
                <p className="sp-section-text">{pitch.solution}</p>
              </div>
              <div className="sp-section">
                <div className="sp-section-label">🎯 Target Market</div>
                <p className="sp-section-text">{pitch.target_market}</p>
              </div>
            </div>

            {/* Feedback list */}
            <div className="sp-feedback-block">
              <div className="sp-feedback-header">
                <h2 className="sp-feedback-title">Community Feedback</h2>
                <span className="feedback-count-pill">{pitch.feedback.length}</span>
              </div>

              {pitch.feedback.length === 0 ? (
                <div className="sp-empty-feedback">
                  <span style={{ fontSize: '2rem' }}>💬</span>
                  <p>No feedback yet — be the first to share your thoughts.</p>
                </div>
              ) : (
                <div className="sp-feedback-list">
                  {pitch.feedback.map((f) => (
                    <div key={f.id} className="sp-feedback-card">
                      <div className="sp-feedback-card-header">
                        <div className="feedback-reviewer">
                          <div className="author-avatar">{getInitials(f.reviewer_name)}</div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{f.reviewer_name}</div>
                            <div style={{ fontSize: '0.73rem', color: 'var(--ink-muted)' }}>{formatDate(f.created_at)}</div>
                          </div>
                        </div>
                        <span className={`sp-verdict ${f.would_use ? 'sp-verdict-yes' : 'sp-verdict-no'}`}>
                          {f.would_use ? '✓ Would use' : '✗ Wouldn\'t use'}
                        </span>
                      </div>
                      <div className="sp-feedback-row">
                        <div className="sp-feedback-col">
                          <div className="sp-feedback-col-label">👍 What I like</div>
                          <p className="sp-feedback-col-text">{f.what_i_like}</p>
                        </div>
                        <div className="sp-feedback-col">
                          <div className="sp-feedback-col-label">🔧 Would change</div>
                          <p className="sp-feedback-col-text">{f.would_change}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Feedback form */}
              {!user && (
                <div className="sp-feedback-gate">
                  <span>💬</span>
                  <p>Log in to leave feedback on this pitch.</p>
                  <Link to="/join" className="btn btn-primary">Log in / Sign up</Link>
                </div>
              )}
              {user && isOwner && (
                <div className="sp-feedback-gate" style={{ background: '#f9f9f9' }}>
                  <span>🚀</span>
                  <p style={{ color: 'var(--ink-muted)' }}>This is your pitch — you can't review your own idea.</p>
                </div>
              )}
              {user && !isOwner && alreadyReviewed && (
                <div className="alert alert-success" style={{ marginTop: '1rem' }}>
                  ✓ You've already submitted feedback on this pitch.
                </div>
              )}
              {user && !isOwner && !alreadyReviewed && (
                <div className="sp-feedback-form">
                  <h3 className="sp-feedback-form-title">Leave Your Feedback</h3>
                  {fbError && <div className="alert alert-error">{fbError}</div>}
                  {fbSuccess && <div className="alert alert-success">{fbSuccess}</div>}
                  <form onSubmit={handleFeedback}>
                    <div className="form-group">
                      <label>What do you like about this pitch?</label>
                      <textarea required placeholder="What's compelling about this idea..."
                        value={feedback.what_i_like}
                        onChange={(e) => setFeedback({ ...feedback, what_i_like: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>What would you change?</label>
                      <textarea required placeholder="What would you do differently..."
                        value={feedback.would_change}
                        onChange={(e) => setFeedback({ ...feedback, would_change: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Would you use this product?</label>
                      <select value={feedback.would_use}
                        onChange={(e) => setFeedback({ ...feedback, would_use: e.target.value === 'true' })}>
                        <option value="true">✓ Yes, I would use it</option>
                        <option value="false">✗ No, I wouldn't use it</option>
                      </select>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%', padding: '0.8rem', fontSize: '0.95rem' }}>
                      {submitting ? 'Submitting...' : 'Submit Feedback →'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </main>

          {/* Sidebar */}
          <aside className="sp-sidebar">

            {/* Author card */}
            <div className="sp-sidebar-card">
              <div className="sp-sidebar-label">Posted by</div>
              <Link to={`/users/${pitch.user_id}`} className="sp-author-card">
                <div className="author-avatar sp-author-avatar">{getInitials(pitch.author_name)}</div>
                <div>
                  <div className="sp-author-name">{pitch.author_name}</div>
                  <div className="sp-author-since">{formatDate(pitch.created_at)}</div>
                </div>
              </Link>
            </div>

            {/* Stats card */}
            <div className="sp-sidebar-card">
              <div className="sp-sidebar-label">Pitch Stats</div>
              <div className="sp-stat-row">
                <span className="sp-stat-icon">💬</span>
                <span className="sp-stat-value">{pitch.feedback.length}</span>
                <span className="sp-stat-name">Responses</span>
              </div>
              {wouldUsePct !== null && (
                <>
                  <div className="sp-stat-row">
                    <span className="sp-stat-icon">👍</span>
                    <span className="sp-stat-value">{wouldUsePct}%</span>
                    <span className="sp-stat-name">Would use it</span>
                  </div>
                  <div className="sp-pct-bar">
                    <div className="sp-pct-fill" style={{ width: `${wouldUsePct}%` }} />
                  </div>
                </>
              )}
            </div>

            {/* Share / back */}
            <div className="sp-sidebar-card">
              <div className="sp-sidebar-label">Share</div>
              <button
                className="btn btn-outline-dark"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => navigator.clipboard.writeText(window.location.href)}
              >
                🔗 Copy Link
              </button>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
