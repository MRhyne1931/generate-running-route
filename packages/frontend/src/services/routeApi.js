const API_BASE = '/api/routes';

async function generateRoute(payload) {
  const res = await fetch(`${API_BASE}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw Object.assign(new Error(data.error || 'Route generation failed'), { status: res.status });
  }
  return data;
}

async function saveRoute(payload) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to save route');
  }
  return data;
}

async function fetchRoutes() {
  const res = await fetch(API_BASE);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch routes');
  }
  return data.routes;
}

async function deleteRoute(id) {
  const res = await fetch(`${API_BASE}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  if (!res.ok && res.status !== 404) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to delete route');
  }
  return res.status;
}

export { generateRoute, saveRoute, fetchRoutes, deleteRoute };
