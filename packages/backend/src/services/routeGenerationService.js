const fetch = require('node-fetch');
const config = require('../config');
const { METERS_PER_MILE } = require('../middleware/validation');

const ORS_DIRECTIONS_URL = 'https://api.openrouteservice.org/v2/directions/foot-walking/geojson';

// Road networks are longer than straight-line distances.
// A factor of 1.4 is a reasonable average for walkable urban/suburban areas.
const ROAD_FACTOR = 1.4;

/**
 * Compute a point offset from (lat, lng) by distanceMeters along bearingDeg.
 * Returns [lng, lat] (GeoJSON / ORS coordinate order).
 */
function offsetPoint(lat, lng, bearingDeg, distanceMeters) {
  const R = 6371000;
  const d = distanceMeters / R;
  const lat1 = (lat * Math.PI) / 180;
  const lon1 = (lng * Math.PI) / 180;
  const bearing = (bearingDeg * Math.PI) / 180;
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(bearing)
  );
  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(d) * Math.cos(lat1),
      Math.cos(d) - Math.sin(lat1) * Math.sin(lat2)
    );
  return [(lon2 * 180) / Math.PI, (lat2 * 180) / Math.PI];
}

async function generateRoute({ requestedDistanceMiles, startLat, startLng }) {
  const requestedMeters = requestedDistanceMiles * METERS_PER_MILE;

  // Build an equilateral triangle: start → wp1 → wp2 → start.
  // All three sides have the same straight-line length (sideMeters).
  // wp1 is at bearing θ from start, wp2 at bearing θ+60° — this gives an
  // equilateral triangle where every side = sideMeters.
  // Total perimeter = 3 * sideMeters; accounting for road factor:
  //   sideMeters = requestedMeters / (3 * ROAD_FACTOR)
  const sideMeters = requestedMeters / (3 * ROAD_FACTOR);
  const bearing = Math.random() * 360;

  const start = [startLng, startLat];
  const wp1 = offsetPoint(startLat, startLng, bearing, sideMeters);
  const wp2 = offsetPoint(startLat, startLng, bearing + 60, sideMeters);

  const requestBody = {
    coordinates: [start, wp1, wp2, start],
  };

  const res = await fetch(ORS_DIRECTIONS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: config.orsApiKey,
    },
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw Object.assign(new Error(`ORS API error: ${res.status}`), { orsError: text });
  }

  const data = await res.json();

  const feature = data.features && data.features[0];
  if (!feature || !feature.geometry || !feature.geometry.coordinates || feature.geometry.coordinates.length < 2) {
    throw new Error('ORS returned no valid route geometry');
  }

  const actualMeters =
    feature.properties &&
    feature.properties.summary &&
    feature.properties.summary.distance;

  const actualDistanceMiles = actualMeters
    ? parseFloat((actualMeters / METERS_PER_MILE).toFixed(2))
    : null;

  return {
    actualDistanceMiles,
    path: {
      type: 'LineString',
      coordinates: feature.geometry.coordinates,
    },
  };
}

module.exports = { generateRoute };

module.exports = { generateRoute };
