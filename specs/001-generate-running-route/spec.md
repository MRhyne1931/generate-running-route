# Feature Specification: Generate Running Route

**Feature Branch**: `001-generate-running-route`  
**Created**: 2026-05-11  
**Status**: Draft  
**Input**: User description: "A simple, single-user application that allows users to create, manage, and track running routes that are randomly generated based on a desired distance, start and finish in the same location, and can be viewed and deleted."

## Clarifications

### Session 2026-05-11

- Q: How does the system know where the route should start? → A: User chooses per request: enter a start/finish address OR use their current location (browser geolocation).
- Q: What does the user see when a generated route is presented for review? → A: An interactive map with the route drawn on it, showing the actual distance, with Save and Discard buttons.
- Q: When route generation fails, what should happen? → A: Show an error message and preserve all inputs so the user can retry immediately without re-entering data.
- Q: Should there be distance bounds? → A: Yes — minimum 0.5 miles, maximum 26.2 miles (marathon); show a validation error if the requested distance is outside this range.
- Q: Should the UI show a loading indicator during route generation? → A: Yes — display a loading indicator while the route is being generated.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Generate and Save a Route (Priority: P1)

A user wants a new running route. They provide a title and a desired distance, and the system generates a random looping route (same start and finish) that is close to the requested distance. The user reviews the proposed route and decides whether to save it or discard it.

**Why this priority**: This is the core value proposition of the application. Without route generation, no other feature has meaning.

**Independent Test**: Can be fully tested by requesting a new route with a title and distance, reviewing the generated route, and confirming save — delivering a persisted route entry.

**Acceptance Scenarios**:

1. **Given** a user is on the route creation screen, **When** they enter a title, desired distance, and either a start/finish address or choose to use their current location, and submit, **Then** a loading indicator is displayed while the route is being generated, followed by a randomly generated round-trip route approximating the requested distance presented for review.
1. **Given** a generated route is presented, **When** the review screen is displayed, **Then** the user sees an interactive map with the full route drawn, the actual distance, and Save and Discard buttons.
2. **Given** a generated route is presented, **When** the user chooses to save it, **Then** the route is persisted and appears in the route list.
3. **Given** a generated route is presented, **When** the user chooses to discard it, **Then** the route is not saved and no list entry is created.
4. **Given** the user requests a 3.1-mile route, **When** the route is generated, **Then** the actual distance is within a reasonable margin of 3.1 miles (best-effort approximation).
5. **Given** the user submits the form with a missing title or distance, **When** validation runs, **Then** an error message is shown and no route is generated.

---

### User Story 2 - View Saved Routes (Priority: P2)

A user wants to see all running routes they have previously saved, displayed in a simple list ordered from newest to oldest.

**Why this priority**: Viewing saved routes gives the user access to their history and supports route reuse, but requires P1 to have value.

**Independent Test**: Can be fully tested by seeding at least two saved routes and verifying they appear in the list, ordered by creation date (newest first), displaying title and distance.

**Acceptance Scenarios**:

1. **Given** at least one route has been saved, **When** the user views the route list, **Then** all saved routes are displayed showing title and distance.
2. **Given** multiple routes exist, **When** the list is displayed, **Then** routes appear in reverse-chronological order (newest first).
3. **Given** no routes have been saved, **When** the user views the route list, **Then** an empty-state message is shown.

---

### User Story 3 - Delete a Route (Priority: P3)

A user wants to permanently remove a saved route they no longer need.

**Why this priority**: Deletion is a quality-of-life feature that keeps the list tidy, but is non-blocking for core usage.

**Independent Test**: Can be fully tested by saving a route, triggering delete, confirming the dialog, and verifying the route no longer appears in the list or persists after page refresh.

**Acceptance Scenarios**:

1. **Given** a route exists in the list, **When** the user initiates a delete action, **Then** a confirmation dialog is displayed before any data is removed.
2. **Given** the confirmation dialog is displayed, **When** the user confirms deletion, **Then** the route is permanently removed and no longer appears in the list.
3. **Given** the confirmation dialog is displayed, **When** the user cancels, **Then** the route is not removed and remains in the list.
4. **Given** a route is deleted, **When** the user refreshes the page, **Then** the deleted route does not reappear.

---

### Edge Cases

- Requested distance below 0.5 miles or above 26.2 miles: system shows a validation error and does not attempt route generation.
- When route generation fails or returns no viable path, the system displays a user-friendly error message and preserves all form inputs (title, distance, location) so the user can retry without re-entering data.
- What happens when the title field exceeds 255 characters?
- How does the list behave when a very large number of routes have been saved?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to create a new running route by providing a title (required, max 255 characters), a desired distance (required, minimum 0.5 miles, maximum 26.2 miles), and a start/finish location — either by typing an address or by choosing to use their current device location (browser geolocation).
- **FR-002**: System MUST generate a random running route that starts and finishes at the same location, approximating the requested distance on a best-effort basis.
- **FR-003**: System MUST present the generated route to the user for review before saving, displaying an interactive map with the route drawn, the actual distance, and Save and Discard buttons.
- **FR-004**: Users MUST be able to choose to save or discard a generated route.
- **FR-005**: System MUST persist saved routes to the backend so they survive page refresh.
- **FR-006**: System MUST display all saved routes in a list showing title and distance, ordered newest first.
- **FR-007**: Users MUST be able to delete a saved route.
- **FR-008**: System MUST display a confirmation dialog before permanently deleting a route.
- **FR-009**: System MUST validate that required fields (title, distance, start/finish location) are provided before generating a route; distance MUST be between 0.5 and 26.2 miles inclusive; user-friendly error messages MUST be shown for any validation failure.
- **FR-010**: System MUST display an empty-state message when no routes have been saved.
- **FR-011**: When route generation fails, the system MUST display a user-friendly error message and preserve all user inputs (title, distance, start/finish location) so the user can retry without re-entering data.
- **FR-012**: System MUST display a loading indicator while route generation is in progress, and remove it once the route is presented or an error is shown.

### Key Entities

- **Route**: Represents a saved running route. Key attributes: title, distance (actual), requested distance, route path/geometry, creation date.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can request, review, and save a new running route in under 60 seconds.
- **SC-002**: The generated route distance is within 15% of the user-requested distance for all valid requests (0.5–26.2 miles).
- **SC-003**: All saved routes persist correctly and are retrievable after a full page refresh.
- **SC-004**: 100% of delete operations require explicit user confirmation before data is removed.
- **SC-005**: The route list always reflects the current persisted state immediately after any create or delete action completes.
- **SC-006**: Users can complete the primary flow (create → save → view) without encountering an unhandled error.

## Assumptions

- The application is single-user; no authentication or user-specific data isolation is required.
- Route generation uses a mapping or geospatial service capable of producing looping routes from a start location; the specific service will be determined during planning.
- The user's start/finish location is provided per route request: either by typing an address or granting browser geolocation permission. No app-wide default location is configured.
- The backend Express.js API and its persistence layer already exist and will be extended to support route storage.
- Desktop-focused UI; no specific mobile-responsive optimization is required for the initial version.
- "Best effort" distance approximation is acceptable; exact distance matching is not required.
- No offline support is needed; the application assumes a working network connection.
