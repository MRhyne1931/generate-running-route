# Coding Guidelines

## Overview

This document outlines the coding standards, style conventions, and quality principles for the copilot-bootcamp-session-2 project. All developers should follow these guidelines to maintain consistency, readability, and maintainability across the codebase.

## General Formatting Rules

### File Structure
- **Indentation**: Use 2 spaces for all indentation (JavaScript, JSON, CSS, Markdown)
- **Line Length**: Keep lines to a reasonable length, ideally under 100 characters for code
- **Trailing Whitespace**: Remove all trailing whitespace
- **Line Endings**: Use LF (Unix-style) line endings

### Naming Conventions

#### Variables and Functions
- Use `camelCase` for variables and function names
- Use descriptive names that clearly indicate purpose
- Avoid single-letter variables except in loops or destructuring
- **Good**: `getUserId`, `calculateTotalPrice`, `isActive`
- **Bad**: `u`, `calc`, `x`, `tmp`

#### Constants
- Use `UPPER_SNAKE_CASE` for constants
- **Good**: `MAX_RETRIES`, `API_BASE_URL`, `DEFAULT_TIMEOUT`
- **Bad**: `maxRetries`, `apiBaseUrl`

#### Components (React)
- Use `PascalCase` for React component names
- File names should match component names
- **Good**: `RunningRoute.js`, `Route.js`, `App.js`
- **Bad**: `runningRoute.js`, `running-route.js`

#### Classes
- Use `PascalCase` for class names
- **Good**: `ApiService`, `RouteRepository`
- **Bad**: `apiService`, `route_repository`

### Code Organization

- **Logical Grouping**: Group related code together
- **Single Responsibility**: Each module, component, or function should have a single, well-defined responsibility
- **Order of Declaration**: 
  - Imports at the top
  - Constants
  - Utility functions
  - Main component/class
  - Helper functions (if any)
  - Exports at the bottom

## Import Organization

### Import Order
Follow this order for imports to maintain consistency:

1. **External Libraries** (Node.js, npm packages)
   ```javascript
   import React, { useState, useEffect } from 'react';
   import { render, screen } from '@testing-library/react';
   ```

2. **Internal Modules** (from the same project)
   ```javascript
   import RouteService from '../services/RouteService';
   import { formatDate } from '../utils/dateFormatter';
   ```

3. **Styles** (CSS imports)
   ```javascript
   import './App.css';
   import styles from './RouteCard.module.css';
   ```

### Import Best Practices
- **Named Imports**: Use named imports when multiple items are exported
  ```javascript
  import { useState, useEffect } from 'react';
  ```
- **Default Imports**: Use default imports for single exports
  ```javascript
  import App from './App';
  ```
- **Relative Paths**: Use relative paths for internal modules
  - Prefer: `import RouteService from '../services/RouteService';`
  - Avoid: `import RouteService from '/src/services/RouteService';`
- **No Circular Dependencies**: Avoid importing modules that depend on the current module
- **Group with Blank Lines**: Separate import groups with a blank line

## Linter Usage

### ESLint Configuration
The project uses ESLint to maintain code quality and consistency. ESLint rules help catch common errors and enforce style guidelines.

### Running ESLint
```bash
# Check for linting errors (if script is configured)
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

### Common Rules Enforced
- No unused variables
- No undefined variables
- Consistent arrow functions
- No console statements in production code (warnings)
- Proper error handling
- Import/export consistency

### Pre-commit Hooks
Follow local linting rules before committing code. Address all linting errors and warnings before opening a pull request.

## Code Quality Principles

### DRY (Don't Repeat Yourself)
- **Extract Common Code**: When you find the same code in multiple places, extract it into a shared function or utility
- **Reusable Components**: Build UI components that can be reused across the application
- **Shared Utilities**: Create utility modules for common operations (date formatting, API calls, validation)
- **Example**:
  ```javascript
  // Instead of repeating date formatting:
  // AVOID
  const formatted1 = date.split('-').reverse().join('/');
  const formatted2 = date.split('-').reverse().join('/');
  
  // GOOD - Extract to utility
  // utils/dateFormatter.js
  export function formatDate(date) {
    return date.split('-').reverse().join('/');
  }
  
  // Use everywhere
  import { formatDate } from '../utils/dateFormatter';
  const formatted1 = formatDate(date);
  const formatted2 = formatDate(date);
  ```

### KISS (Keep It Simple, Stupid)
- **Simple Solutions**: Prefer simple, straightforward implementations over overly complex ones
- **Readability**: Code should be easy to understand at first glance
- **Avoid Premature Optimization**: Write clear code first; optimize only when necessary
- **Clear Logic**: Break complex logic into smaller, understandable functions

### SOLID Principles

#### Single Responsibility Principle (SRP)
- A module/component should have one reason to change
- A function should do one thing well
- **Example**: A `RouteCard` component should only handle displaying a route, not fetching or deleting it

#### Open/Closed Principle
- Open for extension, closed for modification
- Use props and composition to extend component behavior
- Create abstract utilities that can be configured without modification

#### Liskov Substitution Principle
- Subtypes must be substitutable for their parent types
- Follow React component contract consistently
- Don't break expected prop interfaces

#### Interface Segregation Principle
- Clients should depend on specific interfaces, not broad ones
- Don't pass unnecessary props to components
- Keep prop lists focused and minimal

#### Dependency Inversion Principle
- Depend on abstractions, not concrete implementations
- Inject dependencies rather than hardcoding them
- Use React context or prop drilling appropriately

### Performance Considerations
- **Avoid Unnecessary Renders**: Use React hooks like `useMemo` and `useCallback` appropriately
- **Lazy Loading**: Load components and data lazily when possible
- **Efficient Algorithms**: Use appropriate algorithms and data structures
- **Asset Optimization**: Keep components and bundle sizes reasonable

### Error Handling
- **Handle Errors Gracefully**: Always include try-catch blocks around operations that can fail
- **Meaningful Error Messages**: Provide clear, actionable error messages
- **User Feedback**: Inform users when something goes wrong
- **Example**:
  ```javascript
  try {
    const route = await routeService.updateRoute(id, updates);
    setRoute(route);
  } catch (error) {
    console.error('Failed to update route:', error);
    setError('Failed to update route. Please try again.');
  }
  ```

### Comments and Documentation
- **Meaningful Comments**: Only comment "why", not "what" the code does
- **Keep Comments Updated**: Outdated comments are worse than no comments
- **Avoid Obvious Comments**: Don't comment on obvious code
- **JSDoc**: Use JSDoc for public functions and components
- **Example**:
  ```javascript
  // AVOID - obvious comment
  // Set the route to completed
  setRoute({ ...route, completed: true });
  
  // GOOD - explains why, not what
  // Mark route as completed when user checks the checkbox
  setRoute({ ...route, completed: true });
  
  // GOOD - JSDoc for public functions
  /**
   * Formats a date string from ISO format to MM/DD/YYYY
   * @param {string} dateStr - ISO format date string
   * @returns {string} Formatted date string
   */
  export function formatDate(dateStr) {
    // implementation
  }
  ```

### Testing
- **Test Behavior, Not Implementation**: Tests should verify what the code does, not how it does it
- **Descriptive Test Names**: Test names should clearly indicate what is being tested
- **Arrange-Act-Assert**: Follow the AAA pattern in tests
- **DRY in Tests**: Extract common setup and assertions into helper functions
- **Example**:
  ```javascript
  // GOOD - clear test name and structure
  test('should display route title on the card', () => {
    // Arrange
    const route = { id: '1', title: 'Test Route', completed: false };
    
    // Act
    render(<RouteCard route={route} />);
    
    // Assert
    expect(screen.getByText('Test Route')).toBeInTheDocument();
  });
  ```

### Git Practices
- **Atomic Commits**: Each commit should represent one logical change
- **Clear Commit Messages**: Write descriptive commit messages that explain the "why"
- **Feature Branches**: Use feature branches for new work (e.g., `feature/route-editing`)
- **Pull Requests**: Use PRs for code review before merging
- **Example Commit Message**:
  ```
  feat: add ability to edit route title
  
  - Allow users to click on a route item to edit
  - Persist changes to backend
  
  Closes #42
  ```

## Type Safety (if applicable)

While this project uses JavaScript, consider these practices for safer code:
- Use JSDoc type annotations for critical functions
- Validate input data at API boundaries
- Use default values and guard clauses to prevent undefined errors

## File Organization

### Frontend Structure
```
packages/frontend/src/
  components/          # Reusable UI components
    RouteCard/
      RouteCard.js
      RouteCard.css
      __tests__/
        RouteCard.test.js
  services/           # API services and business logic
    RouteService.js
  utils/              # Utility functions
    dateFormatter.js
  __tests__/          # Integration and setup tests
    App.test.js
  App.js              # Main component
  index.js            # Entry point
```

### Backend Structure
```
packages/backend/src/
  routes/             # Express route handlers
    routeRoutes.js
  controllers/        # Business logic
    routeController.js
  services/           # Data access layer
    routeService.js
  middleware/         # Express middleware
    errorHandler.js
  __tests__/          # Tests
    app.test.js
  app.js              # Express app configuration
  index.js            # Server entry point
```

## Code Review Checklist

Before submitting code for review, verify:
- [ ] Code follows naming conventions
- [ ] Imports are organized correctly
- [ ] No linting errors or warnings
- [ ] Code is DRY and avoids repetition
- [ ] Functions/components have single responsibility
- [ ] Error handling is implemented
- [ ] Comments are clear and helpful
- [ ] Tests are written for new functionality
- [ ] Git commits are atomic and well-described
- [ ] No console.log statements left in production code

## Continuous Improvement

These guidelines are living documents. As the project evolves, consider:
- Adding new patterns and best practices
- Updating guidelines based on team feedback
- Keeping tooling and linter configurations current
- Sharing knowledge and code reviews to improve team practices