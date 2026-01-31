import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';

const LoginPasswordPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(formData.email, formData.password);
    if (result?.success) navigate('/dashboard');
  };

  return (
    <div className="auth-form page">
      <div className="form-header">
        <LogIn size={32} />
        <h2>Вход по логину и паролю</h2>
        <p>Используйте email и пароль для входа</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <Mail size={20} />
          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <Lock size={20} />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn-primary">Вход</button>
      </form>

      <div className="alt-actions" style={{ marginTop: 16 }}>
        <p>Или войдите с помощью фото</p>
        <Link to="/login-face" className="link-button">Вход по логин + фото</Link>
      </div>

      <div className="form-footer">
        <p>Нет аккаунта? <Link to="/register" className="link-button">Зарегистрироваться</Link></p>
        <Link to="/reset-password" className="link-button">Забыли пароль?</Link>
      </div>
    </div>
  );
};

export default LoginPasswordPage;
