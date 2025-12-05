import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import FaceLogin from "./FaceLogin";

const LoginForm = () => {
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
    if (result.success) navigate('/dashboard');
  };

  return (
    <div className="auth-form">
      <div className="form-header">
        <LogIn size={32} />
        <h2>Welcome Back</h2>
        <p>Please sign in to your account</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <Mail size={20} />
          <input type="email" name="email" placeholder="Email address"
                 value={formData.email} onChange={handleChange} required />
        </div>

        <div className="input-group">
          <Lock size={20} />
          <input type="password" name="password" placeholder="Password"
                 value={formData.password} onChange={handleChange} required />
        </div>

        <button type="submit" className="btn-primary">Sign In</button>
      </form>

      {/* Face login: использует введённый email */}
      <div style={{ marginTop: 16 }}>
        <FaceLogin email={formData.email} />
      </div>

      <div className="form-footer">
        <p>Don't have an account? <button type="button" onClick={() => navigate('/register')} className="link-button">Sign up</button></p>
        <button type="button" onClick={() => navigate('/reset-password')} className="link-button">Forgot password?</button>
      </div>
    </div>
  );
};

export default LoginForm;
