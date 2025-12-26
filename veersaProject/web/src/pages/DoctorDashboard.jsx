import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './DoctorDashboard.css';

const DoctorDashboard = () => {
  const [doctor, setDoctor] = useState(null);
  const [stats, setStats] = useState({ total: 0, completed: 0, active: 0, pending: 0 });
  const [myConsultations, setMyConsultations] = useState([]);
  const [pendingConsultations, setPendingConsultations] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDoctorData();
    fetchStats();
    fetchConsultations();
  }, []);

  const fetchDoctorData = async () => {
    try {
      const response = await api.get('/doctors/me');
      setDoctor(response.data);
      setIsAvailable(response.data.isAvailable);
    } catch (error) {
      console.error('Error fetching doctor data:', error);
      // If unauthorized, redirect to login
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/doctor/login');
      }
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/doctors/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchConsultations = async () => {
    try {
      const [myConsultationsRes, pendingRes] = await Promise.all([
        api.get('/doctors/consultations'),
        api.get('/doctors/consultations/pending')
      ]);
      setMyConsultations(myConsultationsRes.data);
      setPendingConsultations(pendingRes.data);
    } catch (error) {
      console.error('Error fetching consultations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptConsultation = async (consultationId) => {
    try {
      await api.post(`/doctors/consultations/${consultationId}/accept`);
      alert('Consultation accepted successfully!');
      fetchConsultations();
      fetchStats();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to accept consultation');
    }
  };

  const handleJoinConsultation = (consultationId) => {
    navigate(`/consultation/${consultationId}`);
  };

  const toggleAvailability = async () => {
    try {
      const response = await api.patch('/doctors/availability', {
        isAvailable: !isAvailable
      });
      setIsAvailable(response.data.isAvailable);
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('patient');
    navigate('/');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { className: 'badge-yellow', label: 'Pending' },
      'scheduled': { className: 'badge-blue', label: 'Scheduled' },
      'accepted': { className: 'badge-green', label: 'Accepted' },
      'in-progress': { className: 'badge-purple', label: 'In Progress' },
      'completed': { className: 'badge-gray', label: 'Completed' },
      'cancelled': { className: 'badge-red', label: 'Cancelled' }
    };
    const config = statusConfig[status] || statusConfig['pending'];
    return <span className={`badge ${config.className}`}>{config.label}</span>;
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
    
    return `${dateLabel} at ${timeLabel}`;
  };

  // Filter consultations by tab
  const getFilteredConsultations = () => {
    switch (activeTab) {
      case 'pending':
        return pendingConsultations;
      case 'active':
        return myConsultations.filter(c => ['accepted', 'in-progress'].includes(c.status));
      case 'completed':
        return myConsultations.filter(c => c.status === 'completed');
      default:
        return [];
    }
  };

  const filteredConsultations = getFilteredConsultations();

  if (loading) {
    return (
      <div className="doctor-dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="doctor-dashboard">
      {/* Header */}
      <header className="doctor-header">
        <div className="doctor-header-left">
          <div className="doctor-avatar">👨‍⚕️</div>
          <div className="doctor-info">
            <h1>Dr. {doctor?.name}</h1>
            <p className="doctor-specialty">{doctor?.specialty}</p>
          </div>
        </div>
        <div className="doctor-header-right">
          <div className="availability-toggle">
            <label className="toggle-label">
              <span className={isAvailable ? 'status-available' : 'status-unavailable'}>
                {isAvailable ? '🟢 Available' : '🔴 Unavailable'}
              </span>
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={toggleAvailability}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-pending" onClick={() => setActiveTab('pending')}>
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{stats.pending}</h3>
            <p>Pending Requests</p>
          </div>
        </div>
        <div className="stat-card stat-active" onClick={() => setActiveTab('active')}>
          <div className="stat-icon">🔄</div>
          <div className="stat-content">
            <h3>{stats.active}</h3>
            <p>Active Consultations</p>
          </div>
        </div>
        <div className="stat-card stat-completed" onClick={() => setActiveTab('completed')}>
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.completed}</h3>
            <p>Completed</p>
          </div>
        </div>
        <div className="stat-card stat-total">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total Consultations</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          📨 Pending Requests ({pendingConsultations.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          🎥 Active ({myConsultations.filter(c => ['accepted', 'in-progress'].includes(c.status)).length})
        </button>
        <button
          className={`tab-button ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          ✅ Completed ({myConsultations.filter(c => c.status === 'completed').length})
        </button>
      </div>

      {/* Content */}
      <div className="dashboard-content">
        <div className="consultations-list">
          {filteredConsultations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                {activeTab === 'pending' ? '📭' : activeTab === 'active' ? '🎥' : '📋'}
              </div>
              <h3>
                {activeTab === 'pending' 
                  ? 'No Pending Consultations'
                  : activeTab === 'active'
                  ? 'No Active Consultations'
                  : 'No Completed Consultations'}
              </h3>
              <p>
                {activeTab === 'pending'
                  ? `No consultation requests matching your specialty (${doctor?.specialty}) at the moment.`
                  : activeTab === 'active'
                  ? 'Accept pending consultations to start seeing patients.'
                  : 'Your completed consultations will appear here.'}
              </p>
            </div>
          ) : (
            filteredConsultations.map((consultation) => (
              <div 
                key={consultation._id} 
                className={`consultation-card ${activeTab === 'pending' ? 'pending-card' : ''} ${consultation.status === 'in-progress' ? 'in-progress-card' : ''}`}
              >
                <div className="consultation-headerA">
                  <div className="patient-info">
                    <div className="patient-avatar">👤</div>
                    <div>
                      <h4>{consultation.patient?.name || 'Patient'}</h4>
                      <p className="patient-email">{consultation.patient?.email}</p>
                    </div>
                  </div>
                  {getStatusBadge(consultation.status)}
                </div>
                
                <div className="consultation-details">
                  <div className="detail-item">
                    <span className="detail-label">🏥 Specialty</span>
                    <span className="detail-value">{consultation.specialty}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">📅 Scheduled</span>
                    <span className="detail-value">{formatDateTime(consultation.startTime)}</span>
                  </div>
                  {consultation.patient?.phone && (
                    <div className="detail-item">
                      <span className="detail-label">📞 Phone</span>
                      <span className="detail-value">{consultation.patient.phone}</span>
                    </div>
                  )}
                  {consultation.duration > 0 && (
                    <div className="detail-item">
                      <span className="detail-label">⏱️ Duration</span>
                      <span className="detail-value">{consultation.duration} min</span>
                    </div>
                  )}
                </div>
                
                <div className="consultation-actions">
                  {activeTab === 'pending' && (
                    <button
                      onClick={() => handleAcceptConsultation(consultation._id)}
                      className="accept-button"
                    >
                      ✓ Accept Consultation
                    </button>
                  )}
                  {['accepted', 'in-progress'].includes(consultation.status) && (
                    <button
                      onClick={() => handleJoinConsultation(consultation._id)}
                      className="join-button"
                    >
                      🎥 {consultation.status === 'in-progress' ? 'Rejoin' : 'Join'} Consultation
                    </button>
                  )}
                  {consultation.status === 'completed' && (
                    <button className="view-summary-button">
                      📄 View Summary
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
