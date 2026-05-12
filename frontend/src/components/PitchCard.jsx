import { Link } from 'react-router-dom';

const getInitials = (name = '') =>
  name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export default function PitchCard({ pitch }) {
  return (
    <Link to={`/pitches/${pitch.id}`} style={{ display: 'block' }}>
      <article className="pitch-card">
        {pitch.cover_image_url ? (
          <img className="pitch-card-image" src={pitch.cover_image_url} alt={pitch.name} />
        ) : (
          <div className="pitch-card-image-placeholder">
            {getInitials(pitch.name)}
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
              <span className="feedback-badge">💬 {pitch.feedback_count}</span>
              {Number(pitch.feedback_count) > 0 && (
                <span className="would-use-badge">
                  👍 {Math.round((Number(pitch.would_use_count) / Number(pitch.feedback_count)) * 100)}%
                </span>
              )}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
