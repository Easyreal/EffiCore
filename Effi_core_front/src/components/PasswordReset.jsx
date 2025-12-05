import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { Lock, CheckCircle } from 'lucide-react';

const PasswordReset = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [status, setStatus] = useState('form');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setMessage('Пароли не совпадают');
      return;
    }

    if (formData.password.length < 6) {
      setMessage('Пароль должен быть не менее 6 символов');
      return;
    }

    setStatus('loading');

    try {
      await apiService.confirmPasswordReset(token, formData.password);
      setStatus('success');
      setMessage('Пароль успешно изменён!');

      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.detail || 'Ошибка изменения пароля');
    }
  };

  if (status === 'success') {
    return (
      <div className="confirmation-container">
        <div className="confirmation-card">
          <CheckCircle size={64} color="#10B981" />
          <h2>Пароль изменён!</h2>
          <p>{message}</p>
          <p>Перенаправление на страницу входа...</p>
          <button
            onClick={() => navigate('/login')}
            className="btn-primary"
          >
            Перейти к входу
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-form">
      <div className="form-header">
        <Lock size={32} />
        <h2>Новый пароль</h2>
        <p>Введите новый пароль для вашего аккаунта</p>
      </div>

      {message && (
        <div className={`message ${status === 'error' ? 'error-message' : ''}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <Lock size={20} />
          <input
            type="password"
            placeholder="Новый пароль"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
            minLength={6}
          />
        </div>

        <div className="input-group">
          <Lock size={20} />
          <input
            type="password"
            placeholder="Повторите пароль"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            required
            minLength={6}
          />
        </div>

        <button
          type="submit"
          className="btn-primary"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Изменение...' : 'Изменить пароль'}
        </button>
      </form>
    </div>
  );
};

export default PasswordReset;