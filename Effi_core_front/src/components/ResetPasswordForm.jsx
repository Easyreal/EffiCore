import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ResetPasswordForm = ({ onToggleMode }) => {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { resetPassword, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await resetPassword(email);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleBackToLogin = () => {
    if (onToggleMode) {
      onToggleMode('login');
    } else {
      navigate('/login');
    }
  };

  if (success) {
    return (
      <div className="auth-form">
        <div className="success-message">
          <div className="form-header">
            <Mail size={32} />
            <h2>Проверьте вашу почту</h2>
            <p>Мы отправили ссылку для сброса пароля на ваш email.</p>
          </div>

          <div className="email-sent-info">
            <p><strong>Что делать дальше:</strong></p>
            <ul>
              <li>Проверьте папку "Входящие"</li>
              <li>Если письма нет, проверьте "Спам"</li>
              <li>Перейдите по ссылке в письме</li>
              <li>Установите новый пароль</li>
            </ul>
          </div>

          <div className="form-footer">
            <button
              type="button"
              onClick={handleBackToLogin}
              className="btn-secondary"
            >
              Вернуться к входу
            </button>
            <button
              type="button"
              onClick={() => setSuccess(false)}
              className="link-button"
            >
              Отправить повторно
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-form">
      <div className="form-header">
        <button
          type="button"
          onClick={handleBackToLogin}
          className="back-button"
        >
          <ArrowLeft size={20} />
        </button>
        <h2>Сброс пароля</h2>
        <p>Введите ваш email для получения ссылки сброса</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <Mail size={20} />
          <input
            type="email"
            placeholder="Ваш email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) clearError();
            }}
            required
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
        >
          {loading ? 'Отправка...' : 'Отправить ссылку'}
        </button>
      </form>

      <div className="form-footer">
        <p>
          Вспомнили пароль?{' '}
          <button
            type="button"
            onClick={handleBackToLogin}
            className="link-button"
          >
            Войти в аккаунт
          </button>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordForm;