import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './DoctorLogin.css';

const DoctorLogin = () => {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    specialty: '',
    licenseNumber: '',
    experience: ''
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const specialties = [
    'Cardiology',
    'Dermatology',
    'Pediatrics',
    'General Medicine',
    'Orthopedics',
    'Neurology',
    'Psychiatry',
    'Endocrinology',
    'Gastroenterology',
    'Oncology'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
    if (apiError) {
      setApiError('');
    }
  };

  const validate = () => {
    const newErrors = {};

    if (mode === 'register') {
      if (!formData.name.trim()) newErrors.name = 'Name is required';
      if (!formData.specialty) newErrors.specialty = 'Specialty is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (mode === 'register' && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (validate()) {
      setLoading(true);
      try {
        const endpoint = mode === 'login' ? '/doctors/login' : '/doctors/register';
        const response = await api.post(endpoint, formData);

        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify({ ...response.data.doctor, role: 'doctor' }));
          navigate('/doctor/dashboard');
        }
      } catch (error) {
        setApiError(error.response?.data?.error || `${mode === 'login' ? 'Login' : 'Registration'} failed. Please try again.`);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="doctor-login-container">
      <div className="doctor-login-card">
        <div className="doctor-login-header">
          <div className="doctor-icon">👨‍⚕️</div>
          <h2>{mode === 'login' ? 'Doctor Portal' : 'Doctor Registration'}</h2>
          <p className="doctor-subtitle">
            {mode === 'login' ? 'Sign in to manage consultations' : 'Join our medical team'}
          </p>
        </div>

        {apiError && (
          <div className="alert alert-error">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="doctor-login-form">
          {mode === 'register' && (
            <>
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? 'error' : ''}
                  placeholder="Dr. John Doe"
                  disabled={loading}
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="specialty">Specialty *</label>
                <select
                  id="specialty"
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleChange}
                  className={errors.specialty ? 'error' : ''}
                  disabled={loading}
                >
                  <option value="">Select your specialty</option>
                  {specialties.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
                {errors.specialty && <span className="error-message">{errors.specialty}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="licenseNumber">License Number</label>
                  <input
                    type="text"
                    id="licenseNumber"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    placeholder="MD123456"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="experience">Years of Experience</label>
                  <input
                    type="number"
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    placeholder="5"
                    min="0"
                    disabled={loading}
                  />
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              placeholder="doctor@hospital.com"
              disabled={loading}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              placeholder="Enter your password"
              disabled={loading}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Register')}
          </button>
        </form>

        <div className="doctor-login-footer">
          <p>
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              className="link-button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setErrors({});
                setApiError('');
              }}
              disabled={loading}
            >
              {mode === 'login' ? 'Register here' : 'Sign in'}
            </button>
          </p>
          <p>
            <button
              type="button"
              className="link-button"
              onClick={() => navigate('/')}
              disabled={loading}
            >
              ← Back to Patient Portal
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DoctorLogin;

