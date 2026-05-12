import { Link } from 'react-router-dom';
import { MessageSquare, ThumbsUp } from 'lucide-react';

const getInitials = (name = '') =>
  name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

// Deterministic mesh gradient seeded from pitch ID
function getCardGradient(id) {
  const h1 = (id * 47) % 360;
  const h2 = (id * 97 + 140) % 360;
  const x = 20 + (id % 50);
  const y = 55 + (id % 35);
  return [
    `radial-gradient(ellipse at ${x}% ${y}%, hsl(${h1},65%,22%) 0%, transparent 60%)`,
    `radial-gradient(ellipse at ${100 - x}% ${100 - y}%, hsl(${h2},60%,18%) 0%, transparent 60%)`,
    `linear-gradient(135deg, hsl(${h1},35%,9%) 0%, hsl(${h2},40%,7%) 100%)`,
  ].join(', ');
}

export default function PitchCard({ pitch, index = 0 }) {
  return (
    <Link to={`/pitches/${pitch.id}`} style={{ display: 'block' }}>
      <article className="pitch-card" style={{ animationDelay: `${index * 0.05}s` }}>
        {pitch.cover_image_url ? (
          <img className="pitch-card-image" src={pitch.cover_image_url} alt={pitch.name} />
        ) : (
          <div
            className="pitch-card-image-placeholder"
            style={{ background: getCardGradient(pitch.id) }}
          >
            <span className="pitch-card-initials">{getInitials(pitch.name)}</span>
          </div>
        )}

        <div className="pitch-card-body">
          <div className="pitch-card-industry">{pitch.target_market.split(' ').slice(-2).join(' ')}</div>
          <h2 className="pitch-card-title">{pitch.name}</h2>
          <p className="pitch-card-oneliner">{pitch.one_liner}</p>

          <div className="pitch-card-footer">
            <div className="pitch-card-author">
              <div className="author-avatar">{getInitials(pitch.author_name)}</div>
              <div>
                <div className="author-name">{pitch.author_name}</div>
                <div className="author-date">{formatDate(pitch.created_at)}</div>
              </div>
            </div>
            <div className="pitch-card-meta">
              <span className="feedback-badge"><MessageSquare size={12} /> {pitch.feedback_count}</span>
              {Number(pitch.feedback_count) > 0 && (
                <span className="would-use-badge">
                  <ThumbsUp size={12} /> {Math.round((Number(pitch.would_use_count) / Number(pitch.feedback_count)) * 100)}%
                </span>
              )}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
