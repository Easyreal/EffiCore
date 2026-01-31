import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPasswordPage from './components/LoginForm.jsx';
import LoginFacePage from './components/LoginFacePage.jsx';
import RegisterForm from './components/RegisterForm';
import ResetPasswordForm from './components/ResetPasswordForm';
import EmailConfirmation from './components/EmailConfirmation';
import PasswordReset from './components/PasswordReset';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import EnterPinPage from './components/EnterPinPage.jsx';
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
                  <LoginPasswordWrapper />
                </PublicRoute>
              }
            />
            <Route
              path="/enter-pin"
              element={
                <PublicRoute>
                  <EnterPinPage />
                </PublicRoute>
              }
            />
            <Route
              path="/login-face"
              element={
                <PublicRoute>
                  <LoginFaceWrapper />
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

const LoginPasswordWrapper = () => (
  <LoginPasswordPage
    onToggleMode={(mode) => {
      if (mode === 'register') {
        window.location.href = '/register';
      } else if (mode === 'reset') {
        window.location.href = '/reset-password';
      } else if (mode === 'face') {
        window.location.href = '/login-face';
      }
    }}
  />
);

const LoginFaceWrapper = () => (
  <LoginFacePage
    onToggleMode={(mode) => {
      if (mode === 'login') {
        window.location.href = '/login';
      } else if (mode === 'register') {
        window.location.href = '/register';
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
