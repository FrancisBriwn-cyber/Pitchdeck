import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import PitchCard from '../components/PitchCard';

const getInitials = (name = '') =>
  name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

const STAGE_LABELS = {
  idea: '💡 Just an Idea',
  mvp: '🔨 Building MVP',
  launched: '🚀 Launched',
  traction: '📈 Early Traction',
};

const LOOKING_FOR_LABELS = {
  feedback:  '💬 Honest feedback',
  cofounder: '🤝 Co-founder',
  investors: '💰 Investors / Angels',
  builders:  '🔧 Builders to join',
  beta:      '🧪 Beta testers',
  mentors:   '🧭 Mentors / Advisors',
};

export default function UserProfile() {
  const { id } = useParams();
  const { user: me } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/api/users/${id}`)
      .then((res) => setData(res.data))
      .catch(() => setError('User not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading"><div className="spinner" /> Loading profile...</div>;
  if (error) return <div className="alert alert-error container page">{error}</div>;

  const { user, pitches, feedbackGiven } = data;
  const isOwn = me && me.id === user.id;
  const joinDate = new Date(user.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  const role = user.role || 'founder';
  const lookingForList = user.looking_for ? user.looking_for.split(',').filter(Boolean) : [];
  const totalFeedbackReceived = pitches.reduce((sum, p) => sum + Number(p.feedback_count), 0);

  return (
    <>
      {/* ── Dark header ── */}
      <div className="profile-header">
        <div className="profile-header-accent" />
        <div className="container">

          <div className="profile-header-top">
            {/* Avatar */}
            <div className="profile-avatar-ring">
              <div className="profile-avatar-lg">{getInitials(user.name)}</div>
            </div>

            {/* Info */}
            <div className="profile-header-info">
              <div className="profile-role-badge" data-role={role}>
                {role === 'founder' ? '🚀 Founder' : '🔧 Builder'}
              </div>
              <h1 className="profile-name">{user.name}</h1>
              <p className="profile-email">{user.email}</p>
              <div className="profile-meta-row">
                {user.location && (
                  <span className="profile-meta-chip">📍 {user.location}</span>
                )}
                <span className="profile-meta-chip">🗓 Joined {joinDate}</span>
                {user.linkedin_url && (
                  <a
                    href={user.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="profile-meta-chip profile-meta-link"
                  >
                    LinkedIn ↗
                  </a>
                )}
              </div>
            </div>

            {isOwn && (
              <Link to="/pitches/new" className="btn btn-primary profile-new-pitch-btn">
                + New Pitch
              </Link>
            )}
          </div>

          {/* Stats bar */}
          <div className="profile-stats">
            <div className="profile-stat">
              <span className="profile-stat-number">{pitches.length}</span>
              <span className="profile-stat-label">Pitches Posted</span>
            </div>
            <div className="profile-stat-divider" />
            <div className="profile-stat">
              <span className="profile-stat-number">{feedbackGiven}</span>
              <span className="profile-stat-label">Feedback Given</span>
            </div>
            <div className="profile-stat-divider" />
            <div className="profile-stat">
              <span className="profile-stat-number">{totalFeedbackReceived}</span>
              <span className="profile-stat-label">Feedback Received</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container page">

        {/* ── About card ── */}
        {(user.bio || user.stage || user.industry || user.team_size || lookingForList.length > 0) && (
          <div className="profile-about-card">

            {user.bio && (
              <div className="profile-about-section">
                <span className="profile-about-label">About</span>
                <p className="profile-bio-text">"{user.bio}"</p>
              </div>
            )}

            {(user.stage || user.industry || user.team_size) && (
              <div className="profile-about-section">
                <span className="profile-about-label">Startup Details</span>
                <div className="profile-tags">
                  {user.stage && (
                    <span className="profile-tag profile-tag-stage">
                      {STAGE_LABELS[user.stage] || user.stage}
                    </span>
                  )}
                  {user.industry && (
                    <span className="profile-tag profile-tag-industry">🏭 {user.industry}</span>
                  )}
                  {user.team_size && (
                    <span className="profile-tag">
                      👥 {user.team_size === 'solo' ? 'Solo Founder' : `${user.team_size} people`}
                    </span>
                  )}
                </div>
              </div>
            )}

            {lookingForList.length > 0 && (
              <div className="profile-about-section">
                <span className="profile-about-label">Open to</span>
                <div className="profile-tags">
                  {lookingForList.map((item) => (
                    <span key={item} className="profile-tag profile-tag-looking">
                      {LOOKING_FOR_LABELS[item] || item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Pitches ── */}
        <div className="section-header">
          <h2>Pitches by {user.name.split(' ')[0]}</h2>
          <span className="section-tag">{pitches.length} total</span>
        </div>

        {pitches.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>No pitches yet</h3>
            <p>
              {isOwn
                ? "You haven't posted a pitch yet. Share your first idea!"
                : `${user.name} hasn't posted any pitches yet.`}
            </p>
            {isOwn && (
              <Link to="/pitches/new" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                Post Your First Pitch →
              </Link>
            )}
          </div>
        ) : (
          <div className="pitch-grid">
            {pitches.map((p) => <PitchCard key={p.id} pitch={p} />)}
          </div>
        )}
      </div>
    </>
  );
}
