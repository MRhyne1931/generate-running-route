const fetch = require('node-fetch');
const config = require('../config');
const { METERS_PER_MILE } = require('../middleware/validation');

const ORS_DIRECTIONS_URL = 'https://api.openrouteservice.org/v2/directions/foot-walking/geojson';

async function generateRoute({ requestedDistanceMiles, startLat, startLng }) {
  const requestedMeters = Math.round(requestedDistanceMiles * METERS_PER_MILE);

  const requestBody = {
    coordinates: [[startLng, startLat]],
    options: {
      round_trip: {
        length: requestedMeters,
        points: 3,
      },
    },
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
