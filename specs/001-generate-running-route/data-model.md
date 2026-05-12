# Data Model: Generate Running Route

**Phase**: 1 — Design  
**Date**: 2026-05-11  
**Branch**: `001-generate-running-route`

## Entities

### Route

Represents a saved running route. Created after a user reviews and accepts a generated route.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | string (UUID v4) | Required, unique, immutable | System-generated identifier |
| `title` | string | Required, max 255 characters | User-provided name for the route |
| `requestedDistanceMiles` | number | Required, min 0.5, max 26.2 | Distance the user requested |
| `actualDistanceMiles` | number | Required, > 0 | Actual distance of the generated route |
| `startLocation` | StartLocation | Required | Where the route starts and finishes |
| `path` | GeoJSON LineString | Required | Full route geometry (array of coordinates) |
| `createdAt` | string (ISO 8601) | Required, immutable | Timestamp when route was saved |

### StartLocation (embedded in Route)

| Field | Type | Constraints | Description |
|---|---|---|---|
| `address` | string \| null | Optional | Human-readable address if user typed one; null if geolocation was used |
| `lat` | number | Required, −90 to 90 | Latitude of start/finish point |
| `lng` | number | Required, −180 to 180 | Longitude of start/finish point |

### GeoJSON LineString (embedded in Route)

Standard GeoJSON LineString geometry. Coordinates are `[longitude, latitude]` pairs (GeoJSON convention).

```json
{
  "type": "LineString",
  "coordinates": [
    [-89.6501, 39.7817],
    [-89.6523, 39.7834],
    "..."
  ]
}
```

---

## Example Route (JSON)

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
  "path": {
    "type": "LineString",
    "coordinates": [
      [-89.6501, 39.7817],
      [-89.6523, 39.7834],
      [-89.6501, 39.7817]
    ]
  },
  "createdAt": "2026-05-11T08:30:00.000Z"
}
```

---

## Validation Rules

| Field | Rule |
|---|---|
| `title` | Non-empty string, max 255 characters |
| `requestedDistanceMiles` | Number, ≥ 0.5 and ≤ 26.2 |
| `startLocation.lat` | Number, −90 to 90 |
| `startLocation.lng` | Number, −180 to 180 |
| `path.type` | Must be `"LineString"` |
| `path.coordinates` | Array of `[number, number]` pairs, minimum 2 elements |

---

## State Transitions

```
[Form inputs valid] → [Route generated (unsaved)] → [User saves] → [Route persisted]
                                                   → [User discards] → [No state change]
[Route persisted] → [User deletes (confirmed)] → [Route removed]
```

---

## Storage Format

All routes stored as a flat JSON array in `packages/backend/src/data/routes.json`, sorted newest-first on write. The file is initialised as `[]` if it does not exist.

```json
[
  { "id": "...", "title": "...", "createdAt": "2026-05-11T..." },
  { "id": "...", "title": "...", "createdAt": "2026-05-10T..." }
]
```
