import React from 'react';
import './RouteCard.css';

function RouteCard({ route, onDeleteRequest, onView }) {
  return (
    <div className="route-card">
      <button
        className="route-card__content"
        onClick={() => onView(route)}
        aria-label={`View route "${route.title}"`}
      >
        <span className="route-card__title">{route.title}</span>
        <span className="route-card__distance">{route.actualDistanceMiles.toFixed(2)} mi</span>
      </button>
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
