# Implementation Plan: Generate Running Route

**Branch**: `001-generate-running-route` | **Date**: 2026-05-11 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-generate-running-route/spec.md`

## Summary

Build a single-user React + Express web application that generates random looping (round-trip) running routes of approximately a user-specified distance (0.5–26.2 miles). The user provides a start/finish location (typed address via Nominatim geocoding, or browser geolocation), reviews the generated route on an interactive Leaflet map, and can save or discard it. Saved routes are persisted as a JSON file on the Express backend and displayed in a list (newest first) with delete-with-confirmation support. Route generation is powered by the OpenRouteService Directions API round-trip mode.

## Technical Context

**Language/Version**: JavaScript — Node.js 18+, React 18  
**Primary Dependencies**: React 18, react-leaflet 4.2.x, Leaflet.js, Express 4, Jest, @testing-library/react  
**Storage**: JSON file — `packages/backend/src/data/routes.json` (Node.js `fs` module, single-user, no concurrency)  
**Testing**: Jest + @testing-library/react; 80%+ coverage target (per `docs/testing-guidelines.md`)  
**Target Platform**: Web browser, desktop-focused (Chrome/Firefox/Edge; no mobile optimisation)  
**Project Type**: Web application — React frontend + Express backend monorepo (npm workspaces)  
**Performance Goals**: Route generation round-trip (geocode + ORS call + response) completes within 5 seconds  
**Constraints**: Single-user; ORS free tier ~2000 req/month adequate; no auth; desktop-only  
**Scale/Scope**: Single user; JSON file expected to hold ≤ 200 routes comfortably

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: PASS — Constitution file (`/.specify/memory/constitution.md`) is a blank template with no active principles or gates defined. No violations possible. Re-checked post-design: still PASS.

## Project Structure

### Documentation (this feature)

```text
specs/001-generate-running-route/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── contracts/
│   └── api.md           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created here)
```

### Source Code (repository root)

```text
packages/
  frontend/
    src/
      components/
        RouteForm/
          RouteForm.js            # Title, distance, location inputs + submit
          RouteForm.css
          __tests__/RouteForm.test.js
        RouteMap/
          RouteMap.js             # react-leaflet map with route LineString preview
          RouteMap.css
          __tests__/RouteMap.test.js
        RouteList/
          RouteList.js            # Saved routes list with empty-state handling
          RouteList.css
          __tests__/RouteList.test.js
        RouteCard/
          RouteCard.js            # Single saved route row (title, distance, delete)
          RouteCard.css
          __tests__/RouteCard.test.js
        ConfirmDialog/
          ConfirmDialog.js        # Delete confirmation modal
          ConfirmDialog.css
          __tests__/ConfirmDialog.test.js
        LoadingSpinner/
          LoadingSpinner.js       # Route generation in-progress indicator
          LoadingSpinner.css
      services/
        routeApi.js               # Frontend → backend API calls
        geocodingService.js       # Nominatim address → lat/lng + browser geolocation
      App.js
      App.css
      index.js
  backend/
    src/
      routes/
        routes.js                 # Express router: /api/routes
      services/
        routeGenerationService.js # OpenRouteService round-trip API integration
        routeStorageService.js    # JSON file CRUD (read/write routes.json)
      middleware/
        validation.js             # Input validation middleware
      data/
        routes.json               # Persisted routes (initialised as [] if absent)
      index.js                    # Express app entry point
    __tests__/
      routes.test.js
      routeGenerationService.test.js
      routeStorageService.test.js
  package.json                    # npm workspaces root
```

**Structure Decision**: Web application layout (`packages/frontend` + `packages/backend`) — matches the existing monorepo structure documented in `docs/project-overview.md`. No new workspace packages introduced.

## Complexity Tracking

*No constitution violations. Section not applicable.*
