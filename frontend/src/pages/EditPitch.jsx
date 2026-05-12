import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function EditPitch() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', one_liner: '', problem: '', solution: '', target_market: '' });
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/api/pitches/${id}`).then((res) => {
      const { name, one_liner, problem, solution, target_market, user_id } = res.data;
      if (user && user.id !== user_id) { navigate('/'); return; }
      setForm({ name, one_liner, problem, solution, target_market });
    }).catch(() => navigate('/')).finally(() => setLoading(false));
  }, [id, user]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      if (image) data.append('cover_image', image);
      await api.put(`/api/pitches/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      navigate(`/pitches/${id}`);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="loading"><div className="spinner" /> Loading...</div>;

  return (
    <div className="form-page" style={{ alignItems: 'flex-start', paddingTop: '3rem' }}>
      <div className="form-card form-card-wide">
        <div className="form-eyebrow">Edit Pitch</div>
        <h1>Update Your Pitch</h1>
        <p className="form-subtitle">Make changes to your pitch below.</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Startup Name</label>
            <input name="name" required value={form.name} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>One-liner</label>
            <input name="one_liner" required value={form.one_liner} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Target Market</label>
            <input name="target_market" required value={form.target_market} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>The Problem</label>
            <textarea name="problem" required value={form.problem} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>The Solution</label>
            <textarea name="solution" required value={form.solution} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Replace Cover Image <span style={{ fontWeight: 400, color: 'var(--ink-muted)' }}>(optional)</span></label>
            <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
          </div>
          <button type="submit" className="btn btn-primary btn-full">Save Changes →</button>
        </form>
      </div>
    </div>
  );
}
