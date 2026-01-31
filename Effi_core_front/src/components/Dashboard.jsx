import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { LogOut, User, Mail } from 'lucide-react';
import FaceEmbeddingControl from '../components/FaceEmbeddingControl.jsx';
import { apiService } from '../services/api.js';

const Dashboard = () => {
  const { user, logout, loading } = useAuth();

  const [pin, setPin] = useState('');
  const [pinLoading, setPinLoading] = useState(false);
  const [pinExists, setPinExists] = useState(null);
  const [pinInfo, setPinInfo] = useState(null);
  const [pinError, setPinError] = useState(null);

  const handleLogout = async () => {
    await logout();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Today';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Today';
    }
  };

  const fetchPinStatus = async () => {
    setPinError(null);
    try {
      const resp = await apiService.client.get('/face/pin');
      const data = resp.data || {};
      setPinExists(Boolean(data.has_pin));
      setPinInfo(data.has_pin ? { pin_id: data.pin_id, is_active: data.is_active } : null);
    } catch (err) {
      console.error('fetchPinStatus error', err);
      setPinError(err?.response?.data?.detail || err?.response?.data || err?.message || 'Ошибка при получении статуса PIN');
      setPinExists(null);
      setPinInfo(null);
    }
  };

  useEffect(() => {
    fetchPinStatus();
  }, []);

  const createPin = async (e) => {
    e?.preventDefault();
    setPinError(null);

    if (!/^\d{4}$/.test(pin)) {
      setPinError('PIN должен состоять ровно из 4 цифр');
      return;
    }

    if (pinExists) {
      setPinError('Сначала удалите существующий PIN, затем добавьте новый');
      return;
    }

    setPinLoading(true);
    try {
      const form = new FormData();
      form.append('pin', pin);

      await apiService.client.post('/face/pin/create', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setPin('');
      await fetchPinStatus();
    } catch (err) {
      console.error('createPin error', err);
      setPinError(err?.response?.data?.detail || err?.response?.data || err?.message || 'Ошибка при создании PIN');
    } finally {
      setPinLoading(false);
    }
  };

  const deletePin = async () => {
    if (!confirm('Удалить PIN?')) return;
    setPinError(null);
    setPinLoading(true);
    try {
      await apiService.client.delete('/face/pin');
      setPin('');
      await fetchPinStatus();
    } catch (err) {
      console.error('deletePin error', err);
      setPinError(err?.response?.data?.detail || err?.response?.data || err?.message || 'Ошибка при удалении PIN');
    } finally {
      setPinLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Главная страница</h1>
          <button
            onClick={handleLogout}
            className="btn-logout"
            disabled={loading}
          >
            <LogOut size={20} />
            {loading ? 'Logging out...' : 'Выйти'}
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="user-profile">
          <div className="profile-card">
            <div className="profile-header">
              <div className="avatar">
                <User size={48}/>
              </div>
              <div className="profile-info">
                <h2>
                  Добро пожаловать, {user?.first_name || user?.login || 'User'}!
                </h2>
                <p className="profile-email">
                  <Mail size={16}/>
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="profile-details">
              <div className="detail-item">
                <strong>Логин:</strong>
                <span>@{user?.login || 'user'}</span>
              </div>
              <div className="detail-item">
                <strong>Дата регистрации:</strong>
                <span>{formatDate(user?.created_at)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="face-embedding-section" style={{marginTop: 24}}>
          <FaceEmbeddingControl />
        </div>

        <div className="face-pin-section" style={{ marginTop: 24, maxWidth: 520 }}>
          <h3>PIN для защиты при входе по системе логин/фото</h3>

          <div style={{ marginBottom: 12 }}>
            {pinExists === null ? (
              <div style={{ color: '#666' }}>Статус PIN: неизвестен</div>
            ) : pinExists ? (
              <div>PIN установлен</div>
            ) : (
              <div style={{ color: '#666' }}>PIN не установлен</div>
            )}
          </div>

          <form onSubmit={createPin} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="password"
              inputMode="numeric"
              pattern="\d{4}"
              placeholder="Введите PIN (4 цифры)"
              value={pin}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '').slice(0, 4);
                setPin(v);
              }}
              maxLength={4}
              className="input"
              style={{ padding: '8px 10px', flex: 1 }}
              disabled={pinLoading || pinExists}
            />

            <button
              type="submit"
              className="btn-primary"
              disabled={pinLoading || pinExists}
            >
              {pinLoading ? 'Сохранение...' : 'Добавить PIN'}
            </button>

            <button
              type="button"
              onClick={deletePin}
              className="btn-danger"
              disabled={pinLoading || !pinExists}
            >
              {pinLoading ? 'Удаление...' : 'Удалить PIN'}
            </button>
          </form>

          {pinError && <div style={{ color: 'red', marginTop: 10 }}>{String(pinError)}</div>}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
