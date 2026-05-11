# API Contract: Generate Running Route

**Phase**: 1 — Design  
**Date**: 2026-05-11  
**Branch**: `001-generate-running-route`  
**Base URL**: `http://localhost:{PORT}/api`

---

## Endpoints

### 1. Generate a Route (preview only — not saved)

```
POST /api/routes/generate
```

Calls the OpenRouteService Directions API to produce a round-trip route approximating the requested distance. The route is **not** persisted at this step.

**Request Body**

```json
{
  "requestedDistanceMiles": 3.1,
  "startLat": 39.7817,
  "startLng": -89.6501
}
```

| Field | Type | Required | Constraints |
|---|---|---|---|
| `requestedDistanceMiles` | number | Yes | 0.5 – 26.2 |
| `startLat` | number | Yes | −90 to 90 |
| `startLng` | number | Yes | −180 to 180 |

**Success Response** `200 OK`

```json
{
  "actualDistanceMiles": 3.28,
  "path": {
    "type": "LineString",
    "coordinates": [
      [-89.6501, 39.7817],
      [-89.6523, 39.7834],
      [-89.6501, 39.7817]
    ]
  }
}
```

**Error Responses**

| Status | Condition |
|---|---|
| `400 Bad Request` | Missing or invalid fields (distance out of range, invalid coordinates) |
| `502 Bad Gateway` | OpenRouteService API call failed or returned no valid path |

**Error Body (400)**
```json
{ "error": "requestedDistanceMiles must be between 0.5 and 26.2" }
```

---

### 2. Save a Route

```
POST /api/routes
```

Persists a previously generated route with the user-provided title.

**Request Body**

```json
{
  "title": "Morning 5K",
  "requestedDistanceMiles": 3.1,
  "actualDistanceMiles": 3.28,
  "startLocation": {
    "address": "123 Main St, Springfield, IL",
    "lat": 39.7817,
    "lng": -89.6501
  },
  "path": {
    "type": "LineString",
    "coordinates": [[-89.6501, 39.7817], ["..."]]
  }
}
```

| Field | Type | Required | Constraints |
|---|---|---|---|
| `title` | string | Yes | Non-empty, max 255 chars |
| `requestedDistanceMiles` | number | Yes | 0.5 – 26.2 |
| `actualDistanceMiles` | number | Yes | > 0 |
| `startLocation` | object | Yes | Must contain `lat` and `lng` |
| `startLocation.address` | string \| null | No | Human-readable address or null |
| `startLocation.lat` | number | Yes | −90 to 90 |
| `startLocation.lng` | number | Yes | −180 to 180 |
| `path` | object | Yes | Valid GeoJSON LineString |

**Success Response** `201 Created`

```json
{
  "id": "a3f1c2e4-1234-4abc-8def-000011112222",
  "title": "Morning 5K",
  "requestedDistanceMiles": 3.1,
  "actualDistanceMiles": 3.28,
  "startLocation": {
    "address": "123 Main St, Springfield, IL",
    "lat": 39.7817,
    "lng": -89.6501
  },
  "path": { "type": "LineString", "coordinates": ["..."] },
  "createdAt": "2026-05-11T08:30:00.000Z"
}
```

**Error Responses**

| Status | Condition |
|---|---|
| `400 Bad Request` | Missing or invalid fields |

---

### 3. List All Routes

```
GET /api/routes
```

Returns all saved routes, ordered newest first.

**Request**: No parameters.

**Success Response** `200 OK`

```json
{
  "routes": [
    {
      "id": "a3f1c2e4-1234-4abc-8def-000011112222",
      "title": "Morning 5K",
      "requestedDistanceMiles": 3.1,
      "actualDistanceMiles": 3.28,
      "startLocation": {
        "address": "123 Main St, Springfield, IL",
        "lat": 39.7817,
        "lng": -89.6501
      },
      "path": { "type": "LineString", "coordinates": ["..."] },
      "createdAt": "2026-05-11T08:30:00.000Z"
    }
  ]
}
```

Returns `{ "routes": [] }` when no routes are saved.

---

### 4. Delete a Route

```
DELETE /api/routes/:id
```

Permanently removes a saved route.

**Path Parameter**

| Parameter | Type | Description |
|---|---|---|
| `id` | string (UUID) | The `id` of the route to delete |

**Success Response** `204 No Content`  
(Empty body)

**Error Responses**

| Status | Condition |
|---|---|
| `404 Not Found` | No route with the given `id` exists |

**Error Body (404)**
```json
{ "error": "Route not found" }
```

---

## External API Dependencies

### OpenRouteService Directions API

- **Used by**: `POST /api/routes/generate`
- **Endpoint**: `POST https://api.openrouteservice.org/v2/directions/foot-walking`
- **Auth**: `Authorization: Bearer {ORS_API_KEY}` (env var)
- **Key params sent**: `coordinates` (start point), `options.round_trip.length` (metres), `options.round_trip.points` (3)
- **Failure handling**: If ORS returns a non-2xx response or empty geometry, respond `502 Bad Gateway` to the client with inputs preserved

### Nominatim Geocoding API

- **Used by**: Frontend only (not proxied through backend)
- **Endpoint**: `GET https://nominatim.openstreetmap.org/search`
- **Auth**: None (no API key)
- **Headers**: `User-Agent` header required by Nominatim policy
- **Failure handling**: Frontend shows inline error "Address not found, please try again"
