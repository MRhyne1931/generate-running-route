# Research: Generate Running Route

**Phase**: 0 — Pre-Design Research  
**Date**: 2026-05-11  
**Branch**: `001-generate-running-route`

## Decision 1: Round-Trip Route Generation Service

**Decision**: OpenRouteService (ORS) Directions API with `round_trip` option  
**Rationale**: ORS natively supports circular/round-trip route generation via the `round_trip` parameter block in its Directions API. No other free-tier routing service (Mapbox, Google Maps) has equivalent native round-trip support. The `foot-walking` profile is appropriate for running routes.

**Key API details**:
- Endpoint: `POST https://api.openrouteservice.org/v2/directions/foot-walking`
- Round-trip params: `options.round_trip.length` (distance in meters) and `options.round_trip.points` (number of waypoints, default 3)
- API key required: free tier allows ~2000 requests/month (40/day) — adequate for a single-user app
- Response includes GeoJSON geometry and `summary.distance` (meters, actual)
- Each call with the same coordinates produces a different route (non-deterministic), satisfying the "random" requirement

**Alternatives considered**:
- Mapbox Directions API — rejected: no native round-trip support; would require custom waypoint generation algorithm
- Google Maps Directions API — rejected: no native round-trip support; expensive for production use
- OSRM self-hosted — rejected: operational overhead not warranted for a single-user app

---

## Decision 2: Map Display Library

**Decision**: react-leaflet v4.2.x + Leaflet.js + OpenStreetMap tiles  
**Rationale**: `react-leaflet` is the standard React wrapper for Leaflet.js and is actively maintained. It provides a `<GeoJSON>` component that renders LineString geometries directly on the map with full style control. OpenStreetMap tiles are free with no API key (attribution required). This combination is zero-cost and battle-tested.

**Key usage**:
- `<MapContainer>`, `<TileLayer>` (OSM), `<GeoJSON>` from `react-leaflet`
- Also import `leaflet/dist/leaflet.css` for default styles
- Route path rendered as a styled polyline via `<GeoJSON style={{ color: '#ff6b35', weight: 4 }}>`
- Map auto-fits to route bounds using `map.fitBounds(geoJsonLayer.getBounds())`

**Alternatives considered**:
- Mapbox GL JS — rejected: requires API key; higher bundle size; licensing complexity
- Google Maps JS API — rejected: requires API key + billing beyond free quota

---

## Decision 3: Address Geocoding

**Decision**: Nominatim (OpenStreetMap geocoding) for address → coordinates  
**Rationale**: Nominatim is free, requires no API key, and has a generous usage policy (1 req/second). For a single-user app, this is far more than sufficient. The ORS Geocoding API (Pelias) consumes from the same 40 req/day quota as routing, which would reduce available route generation calls.

**Key API details**:
- Endpoint: `GET https://nominatim.openstreetmap.org/search?q={address}&format=json&limit=1`
- Returns: `[{ lat, lon, display_name }]`
- Rate limit: 1 req/second — never a concern for a single user
- Attribution required: "© OpenStreetMap contributors"

**Browser geolocation** (for "use current location"):
- `navigator.geolocation.getCurrentPosition()` — no external API, browser-native
- Returns `{ coords: { latitude, longitude } }`

**Alternatives considered**:
- ORS Geocoding API — rejected: shares the 40 req/day quota with route generation, reducing available daily routes
- Mapbox Geocoding — rejected: requires API key and separate account setup

---

## Decision 4: Backend Persistence

**Decision**: JSON file storage via Node.js `fs` module (`packages/backend/src/data/routes.json`)  
**Rationale**: The application is single-user with no concurrent write scenarios. A JSON file is zero-dependency, simpler than SQLite or any database, and perfectly adequate. The backend reads the file on startup and writes synchronously on save/delete. File size for 100+ routes with GeoJSON paths will be well under 1MB.

**Key implementation notes**:
- File initialised as `[]` if it does not exist
- `fs.readFileSync` / `fs.writeFileSync` for simplicity (no async race conditions at this scale)
- Route IDs generated via `crypto.randomUUID()` (Node.js 18+ built-in, no extra dependency)

**Alternatives considered**:
- SQLite (better-sqlite3) — rejected: overkill for single-user, adds native dependency
- PostgreSQL / MongoDB — rejected: requires a running database service; disproportionate to scope

---

## Resolved Specs Gaps

| Gap from spec | Resolution |
|---|---|
| "Specific mapping service TBD" (Assumptions) | OpenRouteService Directions API (round-trip mode) |
| "Start location available to seed generation" (Assumptions) | Nominatim geocoding for typed address; `navigator.geolocation` for current location |
| Route generation latency target (deferred from clarification) | Target < 5 seconds end-to-end (ORS typical latency ≈ 1–3s; Nominatim ≈ < 1s) |
| "route path/geometry" entity field (data model) | GeoJSON LineString stored as a serialised object in JSON file |
