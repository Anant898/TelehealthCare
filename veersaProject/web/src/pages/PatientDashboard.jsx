import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './PatientDashboard.css';

const SPECIALTIES = [
  { name: 'Cardiology', icon: '❤️', description: 'Heart & cardiovascular' },
  { name: 'Dermatology', icon: '🧴', description: 'Skin conditions' },
  { name: 'Pediatrics', icon: '👶', description: 'Child healthcare' },
  { name: 'General Medicine', icon: '🩺', description: 'Primary care' },
  { name: 'Orthopedics', icon: '🦴', description: 'Bones & joints' },
  { name: 'Neurology', icon: '🧠', description: 'Brain & nervous system' },
  { name: 'Psychiatry', icon: '🧘', description: 'Mental health' },
  { name: 'Endocrinology', icon: '💊', description: 'Hormones & metabolism' },
  { name: 'Gastroenterology', icon: '🫃', description: 'Digestive system' },
  { name: 'Oncology', icon: '🎗️', description: 'Cancer care' }
];

const PatientDashboard = () => {
  const [patient, setPatient] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSpecialtyModal, setShowSpecialtyModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatientData();
    fetchConsultations();
  }, []);

  const fetchPatientData = async () => {
    try {
      const response = await api.get('/patients/me');
      setPatient(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching patient data:', error);
      const errorMessage = error.response?.data?.error || 'Failed to load patient data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchConsultations = async () => {
    try {
      const response = await api.get('/consultations');
      setConsultations(response.data);
    } catch (error) {
      console.error('Error fetching consultations:', error);
    }
  };

  const handleNewConsultationClick = () => {
    setShowSpecialtyModal(true);
  };

  const handleSpecialtySelect = (specialty) => {
    setSelectedSpecialty(specialty);
    setShowSpecialtyModal(false);
    setShowScheduleModal(true);
    
    // Set default date/time to now (for immediate) or next available slot
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    
    setScheduleDate(tomorrow.toISOString().split('T')[0]);
    setScheduleTime('09:00');
  };

  const handleScheduleConsultation = async (isImmediate = false) => {
    setIsScheduling(true);
    try {
      let startTime;
      if (isImmediate) {
        startTime = new Date().toISOString();
      } else {
        startTime = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
      }

      const response = await api.post('/consultations', {
        specialty: selectedSpecialty.name,
        startTime
      });

      setShowScheduleModal(false);
      setSelectedSpecialty(null);
      
      if (isImmediate) {
        // Go directly to consultation room for immediate consultations
        navigate(`/consultation/${response.data.consultation._id}`);
      } else {
        // Refresh list and show success message
        fetchConsultations();
        alert('Consultation scheduled successfully!');
      }
    } catch (error) {
      console.error('Error creating consultation:', error);
      const errorMessage = error.response?.data?.error || 'Failed to create consultation';
      alert(errorMessage);
    } finally {
      setIsScheduling(false);
    }
  };

  const handleJoinConsultation = (consultationId) => {
    navigate(`/consultation/${consultationId}`);
  };

  const handleCancelConsultation = async (consultationId) => {
    if (!window.confirm('Are you sure you want to cancel this consultation?')) {
      return;
    }
    
    try {
      await api.patch(`/consultations/${consultationId}/status`, {
        status: 'cancelled'
      });
      fetchConsultations();
    } catch (error) {
      console.error('Error cancelling consultation:', error);
      alert('Failed to cancel consultation');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { color: '#f59e0b', bg: '#fef3c7', label: 'Pending' },
      'scheduled': { color: '#3b82f6', bg: '#dbeafe', label: 'Scheduled' },
      'accepted': { color: '#10b981', bg: '#d1fae5', label: 'Accepted' },
      'in-progress': { color: '#8b5cf6', bg: '#ede9fe', label: 'In Progress' },
      'completed': { color: '#6b7280', bg: '#f3f4f6', label: 'Completed' },
      'cancelled': { color: '#ef4444', bg: '#fee2e2', label: 'Cancelled' }
    };
    const config = statusConfig[status] || statusConfig['pending'];
    return (
      <span 
        className="status-badge" 
        style={{ 
          backgroundColor: config.bg, 
          color: config.color,
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '0.85rem',
          fontWeight: '600'
        }}
      >
        {config.label}
      </span>
    );
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    let dateLabel;
    if (date.toDateString() === today.toDateString()) {
      dateLabel = 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      dateLabel = 'Tomorrow';
    } else {
      dateLabel = date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
    
    const timeLabel = date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    
    return { dateLabel, timeLabel };
  };

  const canJoin = (consultation) => {
    if (['completed', 'cancelled'].includes(consultation.status)) return false;
    const startTime = new Date(consultation.startTime);
    const now = new Date();
    // Can join 15 minutes before scheduled time
    const joinableTime = new Date(startTime.getTime() - 15 * 60 * 1000);
    return now >= joinableTime;
  };

  const isUpcoming = (consultation) => {
    return ['pending', 'scheduled', 'accepted'].includes(consultation.status);
  };

  const filteredConsultations = consultations.filter(c => {
    if (activeTab === 'upcoming') return isUpcoming(c);
    if (activeTab === 'active') return c.status === 'in-progress';
    if (activeTab === 'past') return ['completed', 'cancelled'].includes(c.status);
    return true;
  });

  if (loading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <div className="error-container">
          <h2>Error Loading Dashboard</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            Retry
          </button>
          <button onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('patient');
            localStorage.removeItem('user');
            navigate('/');
          }} className="logout-button">
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <div className="user-avatar">👤</div>
          <div className="user-info">
            <h1>{patient?.name}</h1>
            <p className="user-email">{patient?.email}</p>
          </div>
        </div>
        <div className="header-right">
          <button onClick={handleNewConsultationClick} className="book-button">
            + Book Consultation
          </button>
          <button onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('patient');
            localStorage.removeItem('user');
            navigate('/');
          }} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Tabs */}
        <div className="consultation-tabs">
          <button 
            className={`tab-button ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming ({consultations.filter(c => isUpcoming(c)).length})
          </button>
          <button 
            className={`tab-button ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            Active ({consultations.filter(c => c.status === 'in-progress').length})
          </button>
          <button 
            className={`tab-button ${activeTab === 'past' ? 'active' : ''}`}
            onClick={() => setActiveTab('past')}
          >
            Past ({consultations.filter(c => ['completed', 'cancelled'].includes(c.status)).length})
          </button>
        </div>

        {/* Consultations List */}
        <div className="consultations-list">
          {filteredConsultations.length === 0 ? (
            <div className="no-consultations">
              <div className="empty-icon">📋</div>
              <h3>No {activeTab} consultations</h3>
              <p>
                {activeTab === 'upcoming' 
                  ? 'Book a consultation to get started with your healthcare journey.'
                  : activeTab === 'active'
                  ? 'You have no active consultations at the moment.'
                  : 'Your completed consultations will appear here.'}
              </p>
              {activeTab === 'upcoming' && (
                <button onClick={handleNewConsultationClick} className="empty-cta-button">
                  Book Your First Consultation
                </button>
              )}
            </div>
          ) : (
            filteredConsultations.map((consultation) => {
              const { dateLabel, timeLabel } = formatDateTime(consultation.startTime);
              const joinable = canJoin(consultation);
              
              return (
                <div key={consultation._id} className={`consultation-card ${consultation.status}`}>
                  <div className="card-header">
                    <div className="specialty-info">
                      <span className="specialty-icon">
                        {SPECIALTIES.find(s => s.name === consultation.specialty)?.icon || '🏥'}
                      </span>
                      <div>
                        <h3>{consultation.specialty}</h3>
                        <p className="doctor-name">
                          {consultation.doctor?.name || 'Doctor will be assigned'}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(consultation.status)}
                  </div>
                  
                  <div className="card-details">
                    <div className="detail-item">
                      <span className="detail-icon">📅</span>
                      <span>{dateLabel}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">🕐</span>
                      <span>{timeLabel}</span>
                    </div>
                    {consultation.duration > 0 && (
                      <div className="detail-item">
                        <span className="detail-icon">⏱️</span>
                        <span>{consultation.duration} min</span>
                      </div>
                    )}
                  </div>

                  <div className="card-actions">
                    {consultation.status === 'in-progress' && (
                      <button
                        onClick={() => handleJoinConsultation(consultation._id)}
                        className="action-button join"
                      >
                        🎥 Rejoin Call
                      </button>
                    )}
                    {isUpcoming(consultation) && joinable && (
                      <button
                        onClick={() => handleJoinConsultation(consultation._id)}
                        className="action-button join"
                      >
                        🎥 Join Now
                      </button>
                    )}
                    {isUpcoming(consultation) && !joinable && (
                      <span className="join-hint">
                        Available 15 min before
                      </span>
                    )}
                    {isUpcoming(consultation) && (
                      <button
                        onClick={() => handleCancelConsultation(consultation._id)}
                        className="action-button cancel"
                      >
                        Cancel
                      </button>
                    )}
                    {consultation.status === 'completed' && (
                      <button className="action-button view">
                        View Summary
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Specialty Selection Modal */}
      {showSpecialtyModal && (
        <div className="modal-overlay" onClick={() => setShowSpecialtyModal(false)}>
          <div className="modal-content specialty-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowSpecialtyModal(false)}>×</button>
            <h2>Choose a Specialty</h2>
            <p className="modal-subtitle">Select the type of care you need</p>
            <div className="specialty-grid">
              {SPECIALTIES.map((specialty) => (
                <button
                  key={specialty.name}
                  className="specialty-card"
                  onClick={() => handleSpecialtySelect(specialty)}
                >
                  <span className="specialty-icon">{specialty.icon}</span>
                  <span className="specialty-name">{specialty.name}</span>
                  <span className="specialty-desc">{specialty.description}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && selectedSpecialty && (
        <div className="modal-overlay" onClick={() => setShowScheduleModal(false)}>
          <div className="modal-content schedule-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowScheduleModal(false)}>×</button>
            
            <div className="schedule-header">
              <span className="selected-specialty-icon">{selectedSpecialty.icon}</span>
              <div>
                <h2>{selectedSpecialty.name}</h2>
                <p>{selectedSpecialty.description}</p>
              </div>
            </div>

            <div className="schedule-options">
              <button 
                className="schedule-option immediate"
                onClick={() => handleScheduleConsultation(true)}
                disabled={isScheduling}
              >
                <span className="option-icon">⚡</span>
                <div className="option-info">
                  <h3>Start Now</h3>
                  <p>Begin consultation immediately</p>
                </div>
              </button>

              <div className="schedule-divider">
                <span>or schedule for later</span>
              </div>

              <div className="schedule-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Date</label>
                    <input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="form-group">
                    <label>Time</label>
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                    />
                  </div>
                </div>
                <button 
                  className="schedule-button"
                  onClick={() => handleScheduleConsultation(false)}
                  disabled={isScheduling || !scheduleDate || !scheduleTime}
                >
                  {isScheduling ? 'Scheduling...' : '📅 Schedule Consultation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
