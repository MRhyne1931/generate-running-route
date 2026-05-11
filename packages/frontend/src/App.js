import React, { useState, useEffect } from 'react';
import './App.css';
import RouteForm from './components/RouteForm/RouteForm';
import RouteMap from './components/RouteMap/RouteMap';
import RouteList from './components/RouteList/RouteList';
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner';
import { generateRoute, saveRoute, fetchRoutes, deleteRoute } from './services/routeApi';
import { geocodeAddress, getCurrentLocation } from './services/geocodingService';

function App() {
  const [routes, setRoutes] = useState([]);
  const [generatedRoute, setGeneratedRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formInputs, setFormInputs] = useState(null);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  useEffect(() => {
    fetchRoutes()
      .then(setRoutes)
      .catch(() => {});
  }, []);

  async function handleFormSubmit({ title, distanceMiles, useCurrentLocation, address }) {
    setError(null);
    setLoading(true);
    setFormInputs({ title, distanceMiles, address });
    try {
      const location = useCurrentLocation
        ? await getCurrentLocation()
        : await geocodeAddress(address);

      const result = await generateRoute({
        requestedDistanceMiles: distanceMiles,
        startLat: location.lat,
        startLng: location.lng,
      });

      setGeneratedRoute({
        ...result,
        title,
        requestedDistanceMiles: distanceMiles,
        startLat: location.lat,
        startLng: location.lng,
        startAddress: location.address,
      });
    } catch (err) {
      setError(err.message || 'Failed to generate route. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!generatedRoute) return;
    try {
      const saved = await saveRoute({
        title: generatedRoute.title,
        requestedDistanceMiles: generatedRoute.requestedDistanceMiles,
        actualDistanceMiles: generatedRoute.actualDistanceMiles,
        startLocation: {
          address: generatedRoute.startAddress,
          lat: generatedRoute.startLat,
          lng: generatedRoute.startLng,
        },
        path: generatedRoute.path,
      });
      setRoutes((prev) => [saved, ...prev]);
      setGeneratedRoute(null);
      setFormInputs(null);
    } catch (err) {
      setError(err.message || 'Failed to save route.');
    }
  }

  function handleDiscard() {
    setGeneratedRoute(null);
  }

  async function handleDeleteConfirm(id) {
    try {
      await deleteRoute(id);
      setRoutes((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete route.');
    } finally {
      setPendingDeleteId(null);
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">My Routes</h1>
      </header>
      <main className="app-main">
        {error && (
          <div className="app-error" role="alert">
            {error}
          </div>
        )}
        {loading && <LoadingSpinner />}
        {!loading && !generatedRoute && (
          <RouteForm
            onSubmit={handleFormSubmit}
            initialValues={formInputs}
            disabled={loading}
          />
        )}
        {!loading && generatedRoute && (
          <RouteMap
            generatedRoute={generatedRoute}
            onSave={handleSave}
            onDiscard={handleDiscard}
          />
        )}
        <RouteList
          routes={routes}
          pendingDeleteId={pendingDeleteId}
          onDeleteRequest={(id) => setPendingDeleteId(id)}
          onDeleteConfirm={handleDeleteConfirm}
          onDeleteCancel={() => setPendingDeleteId(null)}
        />
      </main>
    </div>
  );
}

export default App;
