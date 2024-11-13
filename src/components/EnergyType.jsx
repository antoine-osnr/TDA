// EnergyType.js
import React from 'react';
import '../styles/productionInformation.css';

const EnergyType = ({ icon, label, value }) => {
  return (
    <div className="energy-type">
      <img src={icon} alt={`${label} icon`} className="energy-icon" />
      <div className="energy-details">
        <span className="energy-label">{label}</span>
        <span className="energy-value">{value} MW</span>
      </div>
    </div>
  );
};

export default EnergyType;
