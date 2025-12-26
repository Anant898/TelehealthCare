import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import VideoConsultation from '../components/VideoConsultation';
import Chat from '../components/Chat';
import Transcription from '../components/Transcription';
import Payment from '../components/Payment';
import './ConsultationRoom.css';

const ConsultationRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [consultation, setConsultation] = useState(null);
  const [roomUrl, setRoomUrl] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);

  // Determine user role from localStorage (memoized to avoid re-computation)
  const userRole = useMemo(() => {
    const userStr = localStorage.getItem('user');
    const patientStr = localStorage.getItem('patient');
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.role || 'patient';
      } catch (e) {
        return 'patient';
      }
    } else if (patientStr) {
      return 'patient';
    }
    return 'patient';
  }, []);

  const navigateBack = useCallback(() => {
    if (userRole === 'doctor') {
      navigate('/doctor/dashboard');
    } else {
      navigate('/dashboard');
    }
  }, [userRole, navigate]);

  const checkPaymentConfig = async () => {
    try {
      const response = await api.get('/payments/config');
      return response.data;
    } catch (error) {
      console.error('Error checking payment config:', error);
      return { configured: false };
    }
  };

  const updateConsultationStatus = useCallback(async (status) => {
    try {
      await api.patch(`/consultations/${id}/status`, { status });
      setConsultation(prev => ({ ...prev, status }));
    } catch (error) {
      console.error('Error updating consultation status:', error);
    }
  }, [id]);

  // Fetch consultation data on mount
  useEffect(() => {
    const fetchConsultation = async () => {
      try {
        const response = await api.get(`/consultations/${id}`);
        setConsultation(response.data.consultation);
        setRoomUrl(response.data.consultation.dailyRoomUrl);
        setToken(response.data.token);

        // Payment is only for patients, not doctors
        if (userRole === 'patient') {
          // Check payment status - skip if Square not configured
          const paymentConfig = await checkPaymentConfig();
          if (!paymentConfig.configured) {
            // Square not configured, skip payment
            setPaymentComplete(true);
            // Only update to in-progress if doctor has already accepted
            if (response.data.consultation.status === 'accepted') {
              await updateConsultationStatus('in-progress');
            }
          } else if (!response.data.consultation.payment) {
            setShowPayment(true);
          } else {
            setPaymentComplete(true);
            // Only update to in-progress if doctor has accepted
            if (response.data.consultation.status === 'accepted') {
              await updateConsultationStatus('in-progress');
            }
          }
        } else {
          // Doctor - skip payment, just join
          setPaymentComplete(true);
          // Update status to in-progress when doctor joins an accepted consultation
          if (response.data.consultation.status === 'accepted') {
            await updateConsultationStatus('in-progress');
          }
        }
      } catch (error) {
        console.error('Error fetching consultation:', error);
        alert('Failed to load consultation');
        navigateBack();
      } finally {
        setLoading(false);
      }
    };

    fetchConsultation();
  }, [id, userRole, navigateBack, updateConsultationStatus]);

  const handlePaymentComplete = async () => {
    setShowPayment(false);
    setPaymentComplete(true);
    // Update status to in-progress after payment
    await updateConsultationStatus('in-progress');
  };

  const handleLeave = useCallback(() => {
    setShowEndModal(true);
  }, []);

  const handleEndConsultation = async () => {
    try {
      await updateConsultationStatus('completed');
      navigateBack();
    } catch (error) {
      console.error('Error ending consultation:', error);
      navigateBack();
    }
  };

  const handleContinueLater = () => {
    // Keep status as in-progress, just leave the room
    navigateBack();
  };

  if (loading) {
    return (
      <div className="consultation-loading">
        <div className="loading-spinner"></div>
        <p>Loading consultation...</p>
      </div>
    );
  }

  if (showPayment && !paymentComplete && userRole === 'patient') {
    return (
      <Payment
        consultationId={id}
        amount={50}
        onComplete={handlePaymentComplete}
        onCancel={navigateBack}
      />
    );
  }

  const getStatusDisplay = () => {
    switch (consultation?.status) {
      case 'scheduled':
        return { label: 'Waiting for Doctor', color: '#f59e0b', isWaiting: true };
      case 'accepted':
        return { label: 'Doctor Accepted', color: '#3b82f6', isWaiting: false };
      case 'in-progress':
        return { label: 'In Progress', color: '#10b981', isWaiting: false };
      default:
        return { label: consultation?.status || 'Unknown', color: '#6b7280', isWaiting: false };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className="consultation-room">
      {/* Consultation Header */}
      <div className="consultation-header">
        <div className="consultation-info-bar">
          <span className="specialty-badge">{consultation?.specialty}</span>
          <span className="status-indicator" style={{ color: statusDisplay.color }}>
            <span className="pulse" style={{ background: statusDisplay.color }}></span>
            {statusDisplay.label}
          </span>
          {userRole === 'doctor' && consultation?.patient && (
            <span className="patient-name-badge">
              Patient: {consultation.patient.name}
            </span>
          )}
          {userRole === 'patient' && consultation?.doctor && (
            <span className="doctor-name-badge">
              Dr. {consultation.doctor.name}
            </span>
          )}
          {userRole === 'patient' && !consultation?.doctor && consultation?.status === 'scheduled' && (
            <span className="waiting-badge">
              A doctor will join soon...
            </span>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="consultation-main">
        <div className="consultation-video-section">
          {roomUrl && token && (
            <VideoConsultation
              roomUrl={roomUrl}
              token={token}
              onLeave={handleLeave}
            />
          )}
        </div>

        <div className="consultation-sidebar">
          <Chat consultationId={id} />
          <Transcription consultationId={id} />
        </div>
      </div>

      {/* End Consultation Modal */}
      {showEndModal && (
        <div className="modal-overlay">
          <div className="end-modal">
            <h2>End Consultation?</h2>
            <p>How would you like to proceed?</p>
            
            <div className="end-options">
              <button 
                className="end-option complete"
                onClick={handleEndConsultation}
              >
                <span className="option-icon">✅</span>
                <div>
                  <h3>Complete Consultation</h3>
                  <p>Mark this consultation as finished</p>
                </div>
              </button>
              
              <button 
                className="end-option pause"
                onClick={handleContinueLater}
              >
                <span className="option-icon">⏸️</span>
                <div>
                  <h3>Leave for Now</h3>
                  <p>You can rejoin this call later</p>
                </div>
              </button>
            </div>
            
            <button 
              className="cancel-button"
              onClick={() => setShowEndModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultationRoom;
