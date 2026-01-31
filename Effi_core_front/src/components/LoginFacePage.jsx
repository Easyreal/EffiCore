import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, LogIn } from 'lucide-react';
import FaceLogin from '../components/FaceLogin';
import { useAuth } from '../context/AuthContext.jsx';

const LoginFacePage = () => {
  const [email, setEmail] = useState('');
  const [localError, setLocalError] = useState(null);
  const { error: authError, clearError, fetchCurrentUser } = useAuth();
  const navigate = useNavigate();

  const handleSuccess = async (data) => {
    setLocalError(null);

    if (typeof fetchCurrentUser === 'function') {
      try {
        await fetchCurrentUser();
      } catch (err) {
        console.warn('fetchCurrentUser failed', err);
      }
    }

    navigate('/dashboard');
  };

  const handleRequiresPin = ({ user_id }) => {
    navigate('/enter-pin', { state: { user_id, email } });
  };

  const handleError = (msg) => {
    setLocalError(msg);
  };

  return (
    <div className="auth-form page">
      <div className="form-header">
        <LogIn size={32} />
        <h2>Вход по логину и фото</h2>
        <p>Введите email и сделайте фото для входа</p>
      </div>

      {/* Показываем ошибки: сначала глобальную из useAuth, затем локальную */}
      {authError && <div className="error-message">{authError}</div>}
      {localError && <div className="error-message">{localError}</div>}

      <div style={{ marginBottom: 12 }}>
        <div className="input-group">
          <Mail size={20} />
          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (authError) clearError();
              setLocalError(null);
            }}
          />
        </div>
      </div>

      {/* Передаём три колбэка: onSuccess, onRequiresPin, onError */}
      <FaceLogin
        email={email}
        onSuccess={handleSuccess}
        onRequiresPin={handleRequiresPin}
        onError={handleError}
      />

      <div className="alt-actions" style={{ marginTop: 16 }}>
        <p>Или войдите обычным способом</p>
        <Link to="/login" className="link-button">Вход по логин/пароль</Link>
      </div>

      <div className="form-footer" style={{ marginTop: 12 }}>
        <p>Нет аккаунта? <Link to="/register" className="link-button">Зарегистрироваться</Link></p>
      </div>
    </div>
  );
};

export default LoginFacePage;
