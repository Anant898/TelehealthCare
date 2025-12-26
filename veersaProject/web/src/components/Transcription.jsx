import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import './Transcription.css';

const Transcription = ({ consultationId }) => {
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const fetchTranscript = useCallback(async () => {
    try {
      const response = await api.get(`/transcription/consultation/${consultationId}`);
      setTranscript(response.data.transcript || '');
    } catch (error) {
      // Only log error if it's not a 404 (no transcript yet)
      if (error.response?.status !== 404) {
        console.error('Error fetching transcript:', error);
      }
    }
  }, [consultationId]);

  useEffect(() => {
    fetchTranscript();
  }, [fetchTranscript]);

  const handleSaveTranscript = async () => {
    try {
      await api.post(`/transcription/consultation/${consultationId}`, {
        transcript
      });
      alert('Transcript saved successfully');
    } catch (error) {
      console.error('Error saving transcript:', error);
      alert('Failed to save transcript');
    }
  };

  return (
    <div className="transcription-container">
      <div className="transcription-header">
        <h3>Live Transcription</h3>
        <div className="transcription-status">
          <span className={`status-indicator ${isRecording ? 'recording' : ''}`}></span>
          <span>{isRecording ? 'Recording' : 'Ready'}</span>
        </div>
      </div>

      <div className="transcription-content">
        {transcript ? (
          <div className="transcript-text">{transcript}</div>
        ) : (
          <div className="no-transcript">
            Transcription will appear here during the consultation
          </div>
        )}
      </div>

      {transcript && (
        <div className="transcription-actions">
          <button onClick={handleSaveTranscript} className="save-button">
            Save Transcript
          </button>
        </div>
      )}
    </div>
  );
};

export default Transcription;

