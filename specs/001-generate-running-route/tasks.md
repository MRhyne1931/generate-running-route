---
description: "Task list for Generate Running Route feature"
---

# Tasks: Generate Running Route

**Input**: Design documents from `/specs/001-generate-running-route/`  
**Prerequisites**: [plan.md](plan.md) ✅ | [spec.md](spec.md) ✅ | [research.md](research.md) ✅ | [data-model.md](data-model.md) ✅ | [contracts/api.md](contracts/api.md) ✅

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel with other [P] tasks in the same phase (different files, no blockers)
- **[US1/US2/US3]**: Which user story this task belongs to
- Exact file paths are included in every task description

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialise the npm workspaces monorepo with all dependencies, tooling, and environment config so all subsequent phases can build immediately.

- [ ] T001 Create root `package.json` with npm workspaces config pointing to `packages/frontend` and `packages/backend`, and `start`/`test` scripts in `package.json`
- [ ] T002 [P] Initialise `packages/frontend/package.json` with React 18, react-dom, react-leaflet 4, leaflet, @testing-library/react, @testing-library/jest-dom, and Jest config in `packages/frontend/package.json`
- [ ] T003 [P] Initialise `packages/backend/package.json` with Express 4, dotenv, node-fetch, cors, and Jest config in `packages/backend/package.json`
- [ ] T004 [P] Create `.env.example` and `packages/backend/src/config.js` loading `ORS_API_KEY` and `PORT` from environment variables
- [ ] T005 [P] Create `packages/frontend/src/index.js` React app entry point mounting `<App />` into `#root`
- [ ] T006 [P] Create `packages/frontend/public/index.html` with `<div id="root">` and Leaflet CSS link

**Checkpoint**: `npm install` at root succeeds; both workspace packages resolved

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core backend infrastructure (Express app, storage service, validation) and frontend base that ALL user stories depend on. Must be complete before any user story work begins.

**⚠️ CRITICAL**: No user story implementation can start until this phase is complete.

- [ ] T007 Create Express app entry point with CORS, JSON body-parser, `/api/routes` router mount, and global error handler in `packages/backend/src/index.js`
- [ ] T008 Create `routeStorageService` with `readRoutes()`, `writeRoutes()`, `addRoute()`, `removeRouteById()` using `fs.readFileSync`/`fs.writeFileSync` on `packages/backend/src/data/routes.json` in `packages/backend/src/services/routeStorageService.js`
- [ ] T009 Initialise persisted data file as an empty JSON array in `packages/backend/src/data/routes.json`
- [ ] T010 [P] Create input validation middleware validating `requestedDistanceMiles` (0.5–26.2), `title` (non-empty, ≤255 chars), `startLat`/`startLng` ranges, and `path` GeoJSON shape in `packages/backend/src/middleware/validation.js`
- [ ] T011 [P] Create Express router skeleton registering placeholder handlers for all four endpoints (`POST /generate`, `POST /`, `GET /`, `DELETE /:id`) in `packages/backend/src/routes/routes.js`
- [ ] T012 Create React `App` component with top-level state: `routes`, `generatedRoute`, `loading`, `error`, and `formInputs`; render empty section placeholders for form and list in `packages/frontend/src/App.js`
- [ ] T013 [P] Create frontend API service with `generateRoute(payload)`, `saveRoute(payload)`, `fetchRoutes()`, `deleteRoute(id)` fetch wrappers targeting `http://localhost:{PORT}/api/routes` in `packages/frontend/src/services/routeApi.js`
- [ ] T014 [P] Create `geocodingService` with `geocodeAddress(address)` calling Nominatim and `getCurrentLocation()` wrapping `navigator.geolocation.getCurrentPosition` in `packages/frontend/src/services/geocodingService.js`

**Checkpoint**: Backend starts (`node packages/backend/src/index.js`); all four endpoints return 501; frontend renders a blank React page without errors

---

## Phase 3: User Story 1 — Generate and Save a Route (Priority: P1) 🎯 MVP

**Goal**: User fills in title, distance, and start location; sees a loading indicator; reviews the generated route on an interactive map; saves or discards it — and a saved route is persisted to the backend.

**Independent Test**: Fill in the form with a valid title, distance (e.g. 3.1), and address → submit → loading spinner appears → Leaflet map renders with route drawn → click Save → verify route appears in the backend JSON file and the UI list updates.

- [ ] T015 [P] [US1] Create `routeGenerationService` that POSTs to the ORS Directions API (`foot-walking` profile, `round_trip.length` in metres, `round_trip.points: 3`) and returns `{ actualDistanceMiles, path }` in `packages/backend/src/services/routeGenerationService.js`
- [ ] T016 [US1] Implement `POST /generate` handler: validate inputs via middleware, call `routeGenerationService`, return `{ actualDistanceMiles, path }` or `502` on ORS failure in `packages/backend/src/routes/routes.js`
- [ ] T017 [US1] Implement `POST /` (save) handler: validate inputs via middleware, assign UUID via `crypto.randomUUID()`, set `createdAt`, call `routeStorageService.addRoute()`, return `201` with saved route in `packages/backend/src/routes/routes.js`
- [ ] T018 [P] [US1] Create `LoadingSpinner` component with accessible `aria-label="Generating route…"` in `packages/frontend/src/components/LoadingSpinner/LoadingSpinner.js` and `packages/frontend/src/components/LoadingSpinner/LoadingSpinner.css`
- [ ] T019 [US1] Create `RouteForm` component with title input, distance input (0.5–26.2 validation), location toggle (address text field vs "Use my location" button), client-side error display, and `onSubmit` prop in `packages/frontend/src/components/RouteForm/RouteForm.js` and `RouteForm.css`
- [ ] T020 [US1] Create `RouteMap` component rendering a `react-leaflet` `MapContainer` with OSM `TileLayer` and a `GeoJSON` layer for the route path, displaying actual distance, Save button, and Discard button in `packages/frontend/src/components/RouteMap/RouteMap.js` and `RouteMap.css`
- [ ] T021 [US1] Wire US1 flow in `App.js`: `RouteForm` submit → `geocodingService` resolves location → call `routeApi.generateRoute()` with `loading: true` → on success set `generatedRoute` and show `RouteMap` → on `502` set `error` message and preserve `formInputs`
- [ ] T022 [US1] Wire Save/Discard in `App.js`: Save calls `routeApi.saveRoute()` then appends to `routes` state and clears `generatedRoute`; Discard clears `generatedRoute` and restores form

**Checkpoint**: Full P1 flow works end-to-end. A saved route is visible in `packages/backend/src/data/routes.json`.

---

## Phase 4: User Story 2 — View Saved Routes (Priority: P2)

**Goal**: All saved routes are displayed in a list (title + distance), ordered newest first, with an empty-state message when none exist.

**Independent Test**: Seed `routes.json` with two routes at different `createdAt` timestamps → load the app → verify both appear in the list newest-first; delete the file contents and reload → verify empty-state message is shown.

- [ ] T023 [US2] Implement `GET /` handler returning `{ routes: [...] }` sorted by `createdAt` descending from `routeStorageService.readRoutes()` in `packages/backend/src/routes/routes.js`
- [ ] T024 [P] [US2] Create `RouteCard` component displaying route `title` and `actualDistanceMiles` (formatted to 2 decimal places with "mi" suffix) in `packages/frontend/src/components/RouteCard/RouteCard.js` and `RouteCard.css`
- [ ] T025 [US2] Create `RouteList` component rendering a `RouteCard` for each route or the empty-state message "No routes yet. Add one to get started! 👻" when array is empty in `packages/frontend/src/components/RouteList/RouteList.js` and `RouteList.css`
- [ ] T026 [US2] Wire US2 in `App.js`: call `routeApi.fetchRoutes()` on mount and after every save; pass `routes` array to `RouteList`

**Checkpoint**: App loads and `RouteList` shows all saved routes newest-first; empty state renders correctly when `routes.json` is `[]`.

---

## Phase 5: User Story 3 — Delete a Route (Priority: P3)

**Goal**: User can permanently delete a saved route after confirming a dialog; the route is removed from the backend and the list updates.

**Independent Test**: Save one route via the UI → click the delete button on its card → verify confirmation dialog appears → click Cancel → route still in list → click Delete again → Confirm → route gone from list and absent from `routes.json` after page refresh.

- [ ] T027 [US3] Implement `DELETE /:id` handler calling `routeStorageService.removeRouteById(id)`; return `204` on success or `404` if not found in `packages/backend/src/routes/routes.js`
- [ ] T028 [P] [US3] Create `ConfirmDialog` component with overlay, "Delete Route?" title, warning message, Cancel (secondary) and Delete (danger) buttons, and `onConfirm`/`onCancel` props in `packages/frontend/src/components/ConfirmDialog/ConfirmDialog.js` and `ConfirmDialog.css`
- [ ] T029 [US3] Add delete icon button to `RouteCard` and `pendingDeleteId` state; show `ConfirmDialog` when delete is clicked; pass `onDeleteConfirm` and `onDeleteCancel` props in `packages/frontend/src/components/RouteCard/RouteCard.js`
- [ ] T030 [US3] Wire US3 in `App.js`: on confirmed delete call `routeApi.deleteRoute(id)` then remove route from `routes` state

**Checkpoint**: Delete flow fully functional. Route removed from list and `routes.json` after confirmation; cancellation leaves route intact.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Apply UI styling, validate all edge cases, and ensure the app is runnable end-to-end from a clean checkout.

- [ ] T031 [P] Apply `docs/ui-guidelines.md` design tokens (color palette, 8px grid spacing, typography scale, border radius) to `packages/frontend/src/App.css` and shared CSS variables
- [ ] T032 [P] Style `RouteForm` input fields, location toggle button, and submit button per ui-guidelines.md primary/secondary button and input field specs in `packages/frontend/src/components/RouteForm/RouteForm.css`
- [ ] T033 [P] Style `RouteCard` card container (shadow, 8px radius, hover effect) and `RouteList` spacing per ui-guidelines.md component specs in `RouteCard.css` and `RouteList.css`
- [ ] T034 Add "Page title: My Routes" header with app-level CSS layout (max-width 600px, centred single column) to `packages/frontend/src/App.js` and `packages/frontend/src/App.css`
- [ ] T035 Verify and document start commands: confirm `npm run start` from root launches both frontend (port 3000) and backend (port 3001) concurrently in root `package.json`

**Checkpoint**: Full smoke test — fresh `npm install && npm run start` → form loads → generate a route → map preview shown → save → list shows route → delete with confirmation → route removed.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — **BLOCKS all user stories**
- **Phase 3 (US1 / P1)**: Depends on Phase 2 — the MVP; deliver first
- **Phase 4 (US2 / P2)**: Depends on Phase 2 — can start in parallel with US1 after Phase 2
- **Phase 5 (US3 / P3)**: Depends on Phase 2 — can start in parallel with US1+US2 after Phase 2
- **Phase 6 (Polish)**: Depends on Phases 3–5

### User Story Dependencies

- **US1 (P1)**: Depends on Foundational only — no dependency on US2 or US3
- **US2 (P2)**: Depends on Foundational only — independently testable (can seed routes.json directly)
- **US3 (P3)**: Depends on Foundational only — independently testable (can seed routes.json directly)

### Within Each User Story

- Backend service → backend endpoint (T015 → T016)
- Backend endpoint available before frontend wiring (T016, T017 → T021)
- Individual frontend components can be built in parallel with each other (T018, T019, T020 are all [P])
- Wiring in App.js (T021, T022) depends on component tasks completing

---

## Parallel Execution Examples

### Phase 2 (Foundational) — can run in parallel
```
T008 routeStorageService.js
T009 routes.json seed file
T010 validation.js middleware     ← parallel
T011 routes.js router skeleton    ← parallel
T013 routeApi.js                  ← parallel
T014 geocodingService.js          ← parallel
```

### Phase 3 (US1) — can run in parallel after T008+T011 complete
```
T015 routeGenerationService.js    ←┐
T018 LoadingSpinner component     ← parallel group
T019 RouteForm component          ←┘
         ↓
T016 POST /generate endpoint (depends T015)
T017 POST /save endpoint (depends T008, T011)
T020 RouteMap component (depends T019 for props contract)
         ↓
T021 App.js US1 wiring (depends T016, T017, T019, T020)
T022 App.js Save/Discard wiring (depends T021)
```

### Phase 4+5 (US2+US3) — can run in parallel with each other
```
T023 GET /routes ←┐
T024 RouteCard    ← parallel (different files)
T027 DELETE /:id  ←┘
T028 ConfirmDialog ← parallel
```

---

## Implementation Strategy

**MVP Scope** (deliver first): Complete Phase 1 + Phase 2 + Phase 3 (US1) only.  
At that point, a user can generate, preview, save, and see their saved routes — a fully working core product.

**Increment 2**: Add Phase 4 (US2 — view saved routes properly) — already partially functional from US1 save flow.  
**Increment 3**: Add Phase 5 (US3 — delete) — isolated backend + two frontend components.  
**Increment 4**: Phase 6 polish.

**Total tasks**: 35  
**Parallelisable tasks**: 18 marked [P]
