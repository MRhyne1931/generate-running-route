import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './RouteMap.css';

function FitBounds({ path }) {
  const map = useMap();
  useEffect(() => {
    if (path && path.coordinates && path.coordinates.length > 0) {
      const latLngs = path.coordinates.map(([lng, lat]) => [lat, lng]);
      map.fitBounds(latLngs, { padding: [24, 24] });
    }
  }, [map, path]);
  return null;
}

function RouteMap({ generatedRoute, onSave, onDiscard }) {
  const { actualDistanceMiles, path, startLat, startLng } = generatedRoute;
  const center = [startLat, startLng];

  const routeStyle = {
    color: '#ff6b35',
    weight: 4,
    opacity: 0.9,
  };

  return (
    <div className="route-map">
      <div className="route-map__info">
        <span className="route-map__distance">
          Actual distance: <strong>{actualDistanceMiles ? `${actualDistanceMiles} mi` : 'Calculating…'}</strong>
        </span>
      </div>
      <div className="route-map__container">
        <MapContainer center={center} zoom={13} className="route-map__leaflet">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <GeoJSON key={JSON.stringify(path)} data={path} style={routeStyle} />
          <FitBounds path={path} />
        </MapContainer>
      </div>
      <div className="route-map__actions">
        <button className="route-map__btn route-map__btn--discard" onClick={onDiscard}>
          Discard
        </button>
        <button className="route-map__btn route-map__btn--save" onClick={onSave}>
          Save Route
        </button>
      </div>
    </div>
  );
}

export default RouteMap;
