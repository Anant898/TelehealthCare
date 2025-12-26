import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Login from '../components/Login';
import PatientRegistration from '../components/PatientRegistration';
import './Home.css';

const Home = () => {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const navigate = useNavigate();

  // Check if user is already logged in and redirect based on role
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Check user role to redirect to appropriate dashboard
      const userStr = localStorage.getItem('user');
      const patientStr = localStorage.getItem('patient');
      
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.role === 'doctor') {
            navigate('/doctor/dashboard');
            return;
          } else if (user.role === 'admin') {
            navigate('/admin/dashboard');
            return;
          }
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
      
      // Default: redirect to patient dashboard
      if (patientStr || userStr) {
        navigate('/dashboard');
      }
    }
  }, [navigate]);

  const handleLoginSubmit = async (formData) => {
    const response = await api.post('/auth/login', formData);
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('patient', JSON.stringify(response.data.patient));
      navigate('/dashboard');
    }
  };

  const handleRegistrationComplete = async (formData) => {
    try {
      const response = await api.post('/auth/register', formData);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('patient', JSON.stringify(response.data.patient));
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.error || 'Registration failed. Please try again.';
      throw new Error(errorMessage);
    }
  };

  const switchToRegister = () => {
    setMode('register');
  };

  const switchToLogin = () => {
    setMode('login');
  };

  return (
    <div className="home-container">
      {mode === 'login' ? (
        <>
          <Login 
            onSubmit={handleLoginSubmit}
            onSwitchToRegister={switchToRegister}
          />
          <div className="portal-links">
            <p className="portal-links-title">Other portals:</p>
            <div className="portal-buttons">
              <button 
                className="portal-link-button doctor"
                onClick={() => navigate('/doctor/login')}
              >
                👨‍⚕️ Doctor Portal
              </button>
              <button 
                className="portal-link-button admin"
                onClick={() => navigate('/admin/login')}
              >
                🛡️ Admin Portal
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="home-header">
            <h1>Telehealth Consultation</h1>
            <p>Access quality healthcare from anywhere</p>
            <button 
              className="back-to-login-button" 
              onClick={switchToLogin}
            >
              ← Back to Login
            </button>
          </div>

          <div className="home-content">
            <PatientRegistration
              onSubmit={handleRegistrationComplete}
              onBack={switchToLogin}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Home;

