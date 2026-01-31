import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { registerAndAddFace } from '../services/face.js';
import { User, Mail, Lock, UserPlus } from 'lucide-react';
import FaceCapture from './FaceCapture.jsx';

const RegisterForm = ({ onToggleMode }) => {
  const [formData, setFormData] = useState({
    login: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);

  const { register, error: authError, clearError } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (authError) clearError();
    if (localError) setLocalError(null);
  };

  const handleFaceFileChange = (file) => {
    setPhotoFile(file);
    if (localError) setLocalError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.login || !formData.email || !formData.password) {
      setLocalError('Please fill required fields');
      return;
    }

    setSubmitting(true);
    setLocalError(null);
    setUploadProgress(null);

    try {
      if (photoFile) {
        const res = await registerAndAddFace(formData, photoFile, null, (progressEvent) => {
          if (progressEvent.lengthComputable) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent);
          }
        });

        console.log('registerAndAddFace result', res);
        alert('Registration successful! Please check your email for confirmation.');
        onToggleMode();
        return;
      }

      const regResult = await register(formData);
      let userId = regResult?.data?.id || regResult?.data?.user?.id || regResult?.id || null;

      if (!userId) {
        try {
          const me = await apiService.getCurrentUser();
          userId = me?.id;
        } catch (err) {
          console.warn('Cannot get current user after register', err);
        }
      }

      alert('Registration successful! Please check your email for confirmation.');
      onToggleMode();
    } catch (err) {
      console.error('Registration flow error', err);
      setLocalError(err?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
      setUploadProgress(null);
    }
  };


  const displayedError = localError || authError;

  return (
    <div className="auth-form">
      <div className="form-header">
        <UserPlus size={32} />
        <h2>Регистрация</h2>
      </div>

      {displayedError && <div className="error-message">{displayedError}</div>}

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <User size={20} />
          <input
            type="text"
            name="login"
            placeholder="Логин"
            value={formData.login}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-row">
          <div className="input-group">
            <input
              type="text"
              name="first_name"
              placeholder="Имя"
              value={formData.first_name}
              onChange={handleChange}
            />
          </div>
          <div className="input-group">
            <input
              type="text"
              name="last_name"
              placeholder="Фамилия"
              value={formData.last_name}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="input-group">
          <Mail size={20} />
          <input
            type="email"
            name="email"
            placeholder="Email"
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
            placeholder="пароль"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        {/*<FaceCapture initialFile={photoFile} onChangeFile={handleFaceFileChange} />*/}

        <div style={{ marginTop: 12 }}>
          {/*{photoFile ? (*/}
          {/*  <div style={{ marginBottom: 12 }}>*/}
          {/*    <strong>Фото:</strong> ({Math.round((photoFile.size || 0) / 1024)} KB)*/}
          {/*  </div>*/}
          {/*) : (*/}
          {/*  <div style={{ marginBottom: 12, color: '#666' }}></div>*/}
          {/*)}*/}

          {/*{uploadProgress !== null && (*/}
          {/*  <div style={{ marginBottom: 8 }}>*/}
          {/*    Upload progress: {uploadProgress}%*/}
          {/*  </div>*/}
          {/*)}*/}

          <button
            type="submit"
            className="btn-primary"
            disabled={!formData.email || !formData.password || submitting}
          >
            {submitting ? 'Processing...' : 'Зарегистрироваться'}
          </button>
        </div>
      </form>

      <div className="form-footer" style={{ marginTop: 12 }}>
        <p>
          Уже есть аккаунт?{' '}
          <button type="button" onClick={onToggleMode} className="link-button">Войти</button>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
