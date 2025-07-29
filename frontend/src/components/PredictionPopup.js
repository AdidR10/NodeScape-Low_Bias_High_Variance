import React from 'react';

const PredictionPopup = ({ isOpen, prediction, onClose }) => {
  if (!isOpen) return null;

  const getPredictionColor = (type) => {
    switch (type) {
      case 'Tree':
        return '#4CAF50'; // Green
      case 'Cycle':
        return '#FF9800'; // Orange
      case 'DAG':
        return '#2196F3'; // Blue
      default:
        return '#757575'; // Gray
    }
  };

  const getPredictionIcon = (type) => {
    switch (type) {
      case 'Tree':
        return '🌳';
      case 'Cycle':
        return '🔄';
      case 'DAG':
        return '📊';
      default:
        return '❓';
    }
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="prediction-popup" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <h3>Graph Prediction</h3>
          <button className="popup-close" onClick={onClose}>×</button>
        </div>
        
        <div className="popup-content">
          <div className="prediction-result">
            <div 
              className="prediction-icon"
              style={{ color: getPredictionColor(prediction.type) }}
            >
              {getPredictionIcon(prediction.type)}
            </div>
            <div className="prediction-details">
              <h4 className="prediction-type">{prediction.type}</h4>
              <p className="prediction-value">Confidence: {prediction.value}</p>
            </div>
          </div>
        </div>
        
        <div className="popup-footer">
          <button className="button secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PredictionPopup; 