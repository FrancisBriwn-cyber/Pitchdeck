import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function CreatePitch() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: '', one_liner: '', problem: '', solution: '', target_market: '',
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const applyFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleFileInput = (e) => applyFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    applyFile(e.dataTransfer.files[0]);
  };

  const removeImage = () => {
    setImage(null);
    setPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      if (image) data.append('cover_image', image);
      const res = await api.post('/api/pitches', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate(`/pitches/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create pitch.');
    } finally { setLoading(false); }
  };

  return (
    <div className="form-page" style={{ alignItems: 'flex-start', paddingTop: '3rem' }}>
      <div className="form-card form-card-wide">
        <div className="form-eyebrow">Share Your Idea</div>
        <h1>Post a Pitch</h1>
        <p className="form-subtitle">Be specific — the more context you give, the better feedback you'll receive.</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>

          {/* Cover image upload */}
          <div className="form-group">
            <label>Cover Image <span className="form-label-hint">(optional — helps your pitch stand out)</span></label>

            {preview ? (
              <div className="pitch-image-preview">
                <img src={preview} alt="Cover preview" />
                <button type="button" className="pitch-image-remove" onClick={removeImage} title="Remove image">✕</button>
              </div>
            ) : (
              <div
                className={`pitch-upload-area ${dragging ? 'pitch-upload-dragging' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
              >
                <span className="pitch-upload-icon">🖼️</span>
                <span className="pitch-upload-text">Drop an image here or <u>click to browse</u></span>
                <span className="pitch-upload-hint">PNG, JPG, WEBP · max 5 MB</span>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileInput}
            />
          </div>

          <div className="form-group">
            <label>Startup Name</label>
            <input name="name" required placeholder="e.g. PaySplit" value={form.name} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>One-liner <span className="form-label-hint">(one sentence)</span></label>
            <input name="one_liner" required placeholder="Describe your startup in one clear sentence" value={form.one_liner} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Target Market</label>
            <input name="target_market" required placeholder="Who exactly is this for?" value={form.target_market} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>The Problem</label>
            <textarea name="problem" required placeholder="What pain point does this solve? Be specific." value={form.problem} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>The Solution</label>
            <textarea name="solution" required placeholder="How does your startup solve it?" value={form.solution} onChange={handleChange} />
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Publishing...' : 'Publish Pitch →'}
          </button>
        </form>
      </div>
    </div>
  );
}
