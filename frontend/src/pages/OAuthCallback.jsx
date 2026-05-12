import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) { navigate('/join'); return; }

    // Store token first so the axios interceptor can attach it
    localStorage.setItem('token', token);

    // Fetch the real user object from the DB using the token
    api.get('/api/auth/me')
      .then((res) => {
        login(res.data.user, token);
        navigate('/');
      })
      .catch(() => {
        localStorage.removeItem('token');
        navigate('/join');
      });
  }, []);

  return <div className="loading"><div className="spinner" /> Signing you in...</div>;
}
