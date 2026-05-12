const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

async function geocodeAddress(address) {
  const params = new URLSearchParams({ q: address, format: 'json', limit: '1' });
  const res = await fetch(`${NOMINATIM_URL}?${params}`, {
    headers: { 'User-Agent': 'generate-running-route/1.0' },
  });
  if (!res.ok) {
    throw new Error('Geocoding request failed');
  }
  const results = await res.json();
  if (!results || results.length === 0) {
    throw new Error('Address not found, please try a different address');
  }
  return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon), address };
}

function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          address: null,
        });
      },
      (err) => {
        reject(new Error('Unable to retrieve your location. Please enter an address instead.'));
      },
      { timeout: 10000 }
    );
  });
}

export { geocodeAddress, getCurrentLocation };
