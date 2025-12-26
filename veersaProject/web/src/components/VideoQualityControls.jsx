import React, { useState } from 'react';
import DailyService from '../services/daily';
import './VideoQualityControls.css';

const VideoQualityControls = ({ onQualityChange }) => {
  const [selectedQuality, setSelectedQuality] = useState('auto');

  const handleQualityChange = async (quality) => {
    setSelectedQuality(quality);
    
    if (quality !== 'auto') {
      await DailyService.setVideoQuality(quality);
    }
    
    if (onQualityChange) {
      onQualityChange(quality);
    }
  };

  return (
    <div className="video-quality-controls">
      <label>Video Quality:</label>
      <select
        value={selectedQuality}
        onChange={(e) => handleQualityChange(e.target.value)}
        className="quality-select"
      >
        <option value="auto">Auto</option>
        <option value="low">Low (Save Data)</option>
        <option value="medium">Medium</option>
        <option value="high">High (HD)</option>
      </select>
    </div>
  );
};

export default VideoQualityControls;

