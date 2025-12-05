import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

const EmailConfirmation = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  console.log('🔑 Token from URL:', token);

  useEffect(() => {
    if (token && token !== 'undefined') {
      confirmEmail();
    } else {
      setStatus('error');
      setMessage('Токен подтверждения не найден');
    }
  }, [token]);

  const confirmEmail = async () => {
    try {
      setStatus('loading');
      console.log('📤 Sending confirmation request...');

      const result = await apiService.confirmEmail(token);
      console.log('✅ Confirmation successful:', result);

      setStatus('success');
      setMessage('Ваш email успешно подтверждён! Теперь вы можете войти в систему.');

      setTimeout(() => {
        navigate('/login');
      }, 5000);

    } catch (error) {
      console.error('❌ Confirmation error:', error);
      console.error('Error details:', error.response?.data);

      let errorMessage = 'Не удалось подтвердить email. ';

      if (error.response?.data?.detail) {
        errorMessage += error.response.data.detail;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Ссылка может быть устаревшей или неверной.';
      }

      setStatus('error');
      setMessage(errorMessage);
    }
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  const handleRetry = () => {
    if (token) {
      setStatus('loading');
      confirmEmail();
    }
  };

  const getStatusContent = () => {
    switch (status) {
      case 'loading':
        return (
          <>
            <Loader size={64} className="loading-spinner" />
            <h2>Подтверждение email</h2>
            <p>Пожалуйста, подождите...</p>
            <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
              <p>Токен: {token ? `${token.substring(0, 20)}...` : 'не найден'}</p>
            </div>
          </>
        );

      case 'success':
        return (
          <>
            <CheckCircle size={64} color="#10B981" />
            <h2>Email подтверждён!</h2>
            <p>{message}</p>
            <p className="redirect-text">Вы будете перенаправлены на страницу входа через 5 секунд...</p>
            <div className="action-buttons">
              <button
                onClick={handleGoToLogin}
                className="btn-primary"
              >
                Перейти к входу сейчас
              </button>
            </div>
          </>
        );

      case 'error':
        return (
          <>
            <XCircle size={64} color="#EF4444" />
            <h2>Ошибка подтверждения</h2>
            <p>{message}</p>
            <div className="action-buttons">
              <button
                onClick={handleGoToLogin}
                className="btn-primary"
              >
                Перейти к входу
              </button>
              <button
                onClick={handleRetry}
                className="btn-secondary"
              >
                Попробовать снова
              </button>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="confirmation-container">
      <div className="confirmation-card">
        {getStatusContent()}
      </div>
    </div>
  );
};

export default EmailConfirmation;
