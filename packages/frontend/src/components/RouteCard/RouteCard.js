import React from 'react';
import './RouteCard.css';

function RouteCard({ route, onDeleteRequest }) {
  return (
    <div className="route-card">
      <div className="route-card__content">
        <span className="route-card__title">{route.title}</span>
        <span className="route-card__distance">{route.actualDistanceMiles.toFixed(2)} mi</span>
      </div>
      <button
        className="route-card__delete"
        aria-label={`Delete route "${route.title}"`}
        onClick={() => onDeleteRequest(route.id)}
      >
        ✕
      </button>
    </div>
  );
}

export default RouteCard;
