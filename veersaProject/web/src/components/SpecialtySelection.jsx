import React from 'react';
import './SpecialtySelection.css';

const SPECIALTIES = [
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

const SpecialtySelection = ({ onSelect }) => {
  return (
    <div className="specialty-selection">
      <h2>Select Specialty</h2>
      <p className="subtitle">Choose the type of consultation you need</p>
      
      <div className="specialty-grid">
        {SPECIALTIES.map((specialty) => (
          <button
            key={specialty}
            className="specialty-card"
            onClick={() => onSelect(specialty)}
          >
            <div className="specialty-icon">🏥</div>
            <span>{specialty}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SpecialtySelection;

