import React from 'react';
import './LoadingSpinner.css';

function LoadingSpinner() {
  return (
    <div className="loading-spinner" role="status" aria-label="Generating route…">
      <div className="loading-spinner__ring"></div>
      <p className="loading-spinner__text">Generating your route…</p>
    </div>
  );
}

export default LoadingSpinner;
