import { useEffect, useState } from 'react';

let showToastFn = null;
let lastKey = '';
let lastTime = 0;

export function showToast(message, type = 'success') {
  const key = `${type}:${message}`;
  const now = Date.now();
  if (key === lastKey && now - lastTime < 600) return;
  lastKey = key;
  lastTime = now;
  if (showToastFn) showToastFn(message, type);
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    showToastFn = (message, type) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
    };
    return () => { showToastFn = null; };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed', top: '5rem', right: '1.5rem',
      display: 'flex', flexDirection: 'column', gap: '0.6rem', zIndex: 9999,
    }}>
      {toasts.map((t) => (
        <div key={t.id} style={{
          background: t.type === 'error' ? '#dc2626' : '#065f46',
          color: '#fff',
          padding: '0.75rem 1.25rem',
          borderRadius: '6px',
          fontSize: '0.9rem',
          fontWeight: 500,
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          animation: 'slideIn 0.25s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          minWidth: '220px',
        }}>
          {t.type === 'error' ? '✕' : '✓'} {t.message}
        </div>
      ))}
      <style>{`@keyframes slideIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}
