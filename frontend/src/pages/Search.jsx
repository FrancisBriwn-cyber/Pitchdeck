import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import api from '../api/axios';
import PitchCard from '../components/PitchCard';

export default function Search() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!q) { setLoading(false); return; }
    setLoading(true);
    api.get(`/api/pitches/search?q=${encodeURIComponent(q)}`)
      .then((res) => setPitches(res.data))
      .catch(() => setPitches([]))
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <>
      <div className="feed-hero" style={{ padding: '2.5rem 0' }}>
        <div className="feed-hero-inner">
          <span className="feed-hero-eyebrow">Search Results</span>
          <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.5rem)' }}>
            {q ? `"${q}"` : 'All Pitches'}
          </h1>
          {!loading && (
            <p style={{ marginBottom: 0 }}>
              {pitches.length > 0 ? `${pitches.length} pitch${pitches.length !== 1 ? 'es' : ''} found` : 'No results found'}
            </p>
          )}
        </div>
      </div>

      <div className="container" style={{ paddingTop: '2.5rem' }}>
        {loading && (
          <div className="loading"><div className="spinner" /> Searching...</div>
        )}

        {!loading && pitches.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon"><SearchIcon size={36} /></div>
            <h3>No pitches found for &quot;{q}&quot;</h3>
            <p>Try a different keyword — search works across pitch names, one-liners, problems, and solutions.</p>
          </div>
        )}

        {!loading && pitches.length > 0 && (
          <div className="pitch-grid">
            {pitches.map((p) => <PitchCard key={p.id} pitch={p} />)}
          </div>
        )}
      </div>
    </>
  );
}
