import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const EnterPinPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user_id, email } = location.state || {};
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { fetchCurrentUser } = useAuth();

  useEffect(() => {
    if (!user_id || !email) {
      navigate('/login-face', { replace: true });
    }
  }, [user_id, email, navigate]);

  const submitPin = async (e) => {
    e?.preventDefault();
    setError(null);
    if (!/^\d{4}$/.test(pin)) {
      setError('PIN должен состоять ровно из 4 цифр');
      return;
    }
    setLoading(true);
    try {
      const form = new FormData();
      form.append('user_id', String(user_id));
      form.append('pin', pin);


      const resp = await apiService.client.post('/face/verify-pin', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const data = resp.data || {};
      if (data.efficore_token) localStorage.setItem('access_token', data.efficore_token);
      if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token);

      if (typeof fetchCurrentUser === 'function') {
        await fetchCurrentUser();
      }

      if (typeof onSuccess === 'function') {
        onSuccess();
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('verify-pin error', err);
      setError(err?.response?.data?.detail || err?.response?.data || err?.message || 'Неверный PIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form page">
      <h2>Введите PIN</h2>
      <p>Для завершения входа по фото введите PIN, привязанный к аккаунту {email}</p>

      <form onSubmit={submitPin} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          type="password"
          inputMode="numeric"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
          placeholder="4 цифры"
          maxLength={4}
          className="input"
        />
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Проверка...' : 'Подтвердить PIN'}
        </button>
      </form>

      {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
    </div>
  );
};

export default EnterPinPage;
