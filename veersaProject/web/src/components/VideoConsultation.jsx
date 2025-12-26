import React, { useEffect, useRef, useState } from 'react';
import DailyService from '../services/daily';
import './VideoConsultation.css';

const VideoConsultation = ({ roomUrl, token, onLeave }) => {
  const videoContainerRef = useRef(null);
  const [callFrame, setCallFrame] = useState(null);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const onLeaveRef = useRef(onLeave);
  const mountedRef = useRef(true);

  // Keep the ref updated
  useEffect(() => {
    onLeaveRef.current = onLeave;
  }, [onLeave]);

  useEffect(() => {
    mountedRef.current = true;
    let frame = null;

    const initVideo = async () => {
      if (!videoContainerRef.current || !roomUrl || !token) {
        return;
      }

      setError(null);

      try {
        frame = await DailyService.initCallFrame(
          videoContainerRef.current,
          roomUrl,
          token
        );
        
        if (!mountedRef.current) {
          if (frame) frame.destroy();
          return;
        }
        
        setCallFrame(frame);

        // Set up event listener for when user leaves via Daily's button
        frame.on('left-meeting', () => {
          if (onLeaveRef.current) {
            onLeaveRef.current();
          }
        });

        // Handle network events
        frame.on('network-quality-change', (e) => {
          if (e.threshold === 'very-low') {
            console.warn('Network quality is very low');
          }
        });

        // Handle participant events for better UX
        frame.on('participant-joined', (e) => {
          console.log('Participant joined:', e.participant);
        });

        frame.on('participant-left', (e) => {
          console.log('Participant left:', e.participant);
        });

        // Handle errors
        frame.on('error', (e) => {
          console.error('Daily.co error:', e);
          if (mountedRef.current) {
            if (e.errorMsg?.includes('permission')) {
              setError('Camera/microphone access denied. Please enable permissions and try again.');
            } else if (e.errorMsg?.includes('network')) {
              setError('Network connection issue. Please check your internet connection.');
            } else {
              setError('Video call error. Please try refreshing the page.');
            }
          }
        });

      } catch (error) {
        console.error('Video initialization error:', error);
        if (mountedRef.current) {
          // Provide specific error messages
          if (error.message?.includes('NotAllowedError') || error.message?.includes('Permission')) {
            setError('Camera/microphone access denied. Please enable permissions in your browser settings.');
          } else if (error.message?.includes('NotFoundError')) {
            setError('No camera or microphone found. Please connect a device and try again.');
          } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
            setError('Failed to connect to video service. Please check your internet connection.');
          } else {
            setError('Failed to initialize video. Please try again or refresh the page.');
          }
        }
      }
    };

    initVideo();

    return () => {
      mountedRef.current = false;
      if (frame) {
        DailyService.leave().catch(console.error);
      }
    };
  }, [roomUrl, token, retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  if (error) {
    return (
      <div className="video-error">
        <div className="error-content">
          <span className="error-icon">⚠️</span>
          <h3>Connection Error</h3>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={handleRetry} className="retry-button">
              Try Again
            </button>
            <button onClick={() => window.location.reload()} className="refresh-button">
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="video-consultation">
      <div className="video-container" ref={videoContainerRef}></div>
    </div>
  );
};

export default VideoConsultation;
