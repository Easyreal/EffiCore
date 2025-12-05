import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ResetPasswordForm from './components/ResetPasswordForm';
import EmailConfirmation from './components/EmailConfirmation';
import PasswordReset from './components/PasswordReset';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import './styles/App.css';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginFormWrapper />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <RegisterFormWrapper />
                </PublicRoute>
              }
            />
            <Route
              path="/reset-password"
              element={
                <PublicRoute>
                  <ResetPasswordFormWrapper />
                </PublicRoute>
              }
            />

            <Route
              path="/confirm-email/:token"
              element={
                <PublicRoute>
                  <EmailConfirmation />
                </PublicRoute>
              }
            />
            <Route
              path="/reset-password/:token"
              element={
                <PublicRoute>
                  <PasswordReset />
                </PublicRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            {/* только один маршрут для "/" */}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
};

// Обёртки
const LoginFormWrapper = () => (
  <LoginForm
    onToggleMode={(mode) => {
      if (mode === 'register') {
        window.location.href = '/register';
      } else if (mode === 'reset') {
        window.location.href = '/reset-password';
      }
    }}
  />
);

const RegisterFormWrapper = () => (
  <RegisterForm
    onToggleMode={() => {
      window.location.href = '/login';
    }}
  />
);

const ResetPasswordFormWrapper = () => (
  <ResetPasswordForm
    onToggleMode={(mode) => {
      if (mode === 'login') {
        window.location.href = '/login';
      } else {
        window.location.href = '/';
      }
    }}
  />
);

export default App;
