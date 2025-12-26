import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const statsRes = await api.get('/admin/stats');
      setStats(statsRes.data);

      if (activeTab === 'patients') {
        const patientsRes = await api.get('/admin/patients');
        setPatients(patientsRes.data.patients);
      } else if (activeTab === 'doctors') {
        const doctorsRes = await api.get('/admin/doctors');
        setDoctors(doctorsRes.data.doctors);
      } else if (activeTab === 'consultations') {
        const consultationsRes = await api.get('/admin/consultations');
        setConsultations(consultationsRes.data.consultations);
      } else if (activeTab === 'payments') {
        const paymentsRes = await api.get('/admin/payments');
        setPayments(paymentsRes.data.payments);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePatient = async (id) => {
    if (!window.confirm('Are you sure you want to delete this patient?')) return;
    
    try {
      await api.delete(`/admin/patients/${id}`);
      alert('Patient deleted successfully');
      fetchData();
    } catch (error) {
      alert('Failed to delete patient');
    }
  };

  const handleDeleteDoctor = async (id) => {
    if (!window.confirm('Are you sure you want to delete this doctor?')) return;
    
    try {
      await api.delete(`/admin/doctors/${id}`);
      alert('Doctor deleted successfully');
      fetchData();
    } catch (error) {
      alert('Failed to delete doctor');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('patient');
    navigate('/');
  };

  if (loading && !stats) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-left">
          <div className="admin-logo">🛡️</div>
          <div>
            <h1>Admin Dashboard</h1>
            <p>System Management & Analytics</p>
          </div>
        </div>
        <button onClick={handleLogout} className="admin-logout-button">
          Logout
        </button>
      </header>

      {/* Stats Overview */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card stat-patients">
          <div className="stat-header">
            <div className="stat-icon">👥</div>
            <span className="stat-label">Total Patients</span>
          </div>
          <h2>{stats?.overview.totalPatients || 0}</h2>
        </div>

        <div className="admin-stat-card stat-doctors">
          <div className="stat-header">
            <div className="stat-icon">👨‍⚕️</div>
            <span className="stat-label">Total Doctors</span>
          </div>
          <h2>{stats?.overview.totalDoctors || 0}</h2>
        </div>

        <div className="admin-stat-card stat-consultations">
          <div className="stat-header">
            <div className="stat-icon">📋</div>
            <span className="stat-label">Total Consultations</span>
          </div>
          <h2>{stats?.overview.totalConsultations || 0}</h2>
          <div className="stat-breakdown">
            <span>Active: {stats?.overview.activeConsultations || 0}</span>
            <span>Pending: {stats?.overview.pendingConsultations || 0}</span>
            <span>Completed: {stats?.overview.completedConsultations || 0}</span>
          </div>
        </div>

        <div className="admin-stat-card stat-revenue">
          <div className="stat-header">
            <div className="stat-icon">💰</div>
            <span className="stat-label">Total Revenue</span>
          </div>
          <h2>${stats?.overview.totalRevenue?.toFixed(2) || '0.00'}</h2>
          <div className="stat-breakdown">
            <span>Payments: {stats?.overview.successfulPayments || 0}</span>
          </div>
        </div>
      </div>

      {/* Specialty Stats */}
      {stats?.specialtyStats && stats.specialtyStats.length > 0 && (
        <div className="specialty-section">
          <h3>Consultations by Specialty</h3>
          <div className="specialty-grid">
            {stats.specialtyStats.map((spec) => (
              <div key={spec._id} className="specialty-card">
                <span className="specialty-name">{spec._id}</span>
                <span className="specialty-count">{spec.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`admin-tab ${activeTab === 'patients' ? 'active' : ''}`}
          onClick={() => setActiveTab('patients')}
        >
          Patients ({stats?.overview.totalPatients || 0})
        </button>
        <button
          className={`admin-tab ${activeTab === 'doctors' ? 'active' : ''}`}
          onClick={() => setActiveTab('doctors')}
        >
          Doctors ({stats?.overview.totalDoctors || 0})
        </button>
        <button
          className={`admin-tab ${activeTab === 'consultations' ? 'active' : ''}`}
          onClick={() => setActiveTab('consultations')}
        >
          Consultations
        </button>
        <button
          className={`admin-tab ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          Payments
        </button>
      </div>

      {/* Content */}
      <div className="admin-content">
        {activeTab === 'overview' && stats?.recentActivity && (
          <div className="overview-content">
            <div className="recent-section">
              <h3>Recent Patients</h3>
              <div className="recent-list">
                {stats.recentActivity.patients.map((patient) => (
                  <div key={patient._id} className="recent-item">
                    <div className="recent-avatar">👤</div>
                    <div className="recent-info">
                      <span className="recent-name">{patient.name}</span>
                      <span className="recent-email">{patient.email}</span>
                    </div>
                    <span className="recent-date">
                      {new Date(patient.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="recent-section">
              <h3>Recent Consultations</h3>
              <div className="recent-list">
                {stats.recentActivity.consultations.map((consult) => (
                  <div key={consult._id} className="recent-item">
                    <div className="recent-avatar">📋</div>
                    <div className="recent-info">
                      <span className="recent-name">{consult.specialty}</span>
                      <span className="recent-email">
                        {consult.patient?.name} → {consult.doctor?.name || 'Unassigned'}
                      </span>
                    </div>
                    <span className={`badge badge-${consult.status}`}>
                      {consult.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'patients' && (
          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Specialty</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient._id}>
                    <td>{patient.name}</td>
                    <td>{patient.email}</td>
                    <td>{patient.phone}</td>
                    <td>{patient.specialty}</td>
                    <td>{new Date(patient.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        onClick={() => handleDeletePatient(patient._id)}
                        className="delete-button"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'doctors' && (
          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Specialty</th>
                  <th>License</th>
                  <th>Experience</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doctor) => (
                  <tr key={doctor._id}>
                    <td>{doctor.name}</td>
                    <td>{doctor.email}</td>
                    <td>{doctor.specialty}</td>
                    <td>{doctor.licenseNumber || 'N/A'}</td>
                    <td>{doctor.experience || 0} years</td>
                    <td>
                      <span className={doctor.isAvailable ? 'status-available' : 'status-unavailable'}>
                        {doctor.isAvailable ? '🟢 Available' : '🔴 Unavailable'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleDeleteDoctor(doctor._id)}
                        className="delete-button"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'consultations' && (
          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Specialty</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {consultations.map((consult) => (
                  <tr key={consult._id}>
                    <td>{consult.patient?.name || 'N/A'}</td>
                    <td>{consult.doctor?.name || 'Unassigned'}</td>
                    <td>{consult.specialty}</td>
                    <td>
                      <span className={`badge badge-${consult.status}`}>
                        {consult.status}
                      </span>
                    </td>
                    <td>{new Date(consult.startTime).toLocaleString()}</td>
                    <td>{consult.duration || 0} min</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id}>
                    <td>{payment.patient?.name || 'N/A'}</td>
                    <td>${payment.amount?.toFixed(2)}</td>
                    <td>
                      <span className={`badge badge-${payment.status}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                    <td>
                      {payment.receiptUrl ? (
                        <a href={payment.receiptUrl} target="_blank" rel="noopener noreferrer">
                          View
                        </a>
                      ) : (
                        'N/A'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

