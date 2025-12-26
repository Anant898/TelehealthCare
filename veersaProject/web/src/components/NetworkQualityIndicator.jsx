import React, { useState, useEffect } from 'react';
import DailyService from '../services/daily';
import './NetworkQualityIndicator.css';

const NetworkQualityIndicator = () => {
  const [quality, setQuality] = useState('good');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const networkStats = await DailyService.getNetworkQuality();
        if (networkStats) {
          setStats(networkStats);
          // Determine quality based on stats
          // This is simplified - you would check actual packet loss, jitter, etc.
          setQuality('good');
        }
      } catch (error) {
        console.error('Error getting network quality:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getQualityLabel = () => {
    switch (quality) {
      case 'excellent':
        return 'Excellent';
      case 'good':
        return 'Good';
      case 'fair':
        return 'Fair';
      case 'poor':
        return 'Poor';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className={`network-quality-indicator network-${quality}`}>
      <span className="quality-dot"></span>
      <span className="quality-text">{getQualityLabel()}</span>
    </div>
  );
};

export default NetworkQualityIndicator;

