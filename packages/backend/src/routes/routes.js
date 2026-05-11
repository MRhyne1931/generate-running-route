const express = require('express');
const crypto = require('crypto');
const { validateGenerateInput, validateSaveInput } = require('../middleware/validation');
const { generateRoute } = require('../services/routeGenerationService');
const { readRoutes, addRoute, removeRouteById } = require('../services/routeStorageService');

const router = express.Router();

// POST /api/routes/generate — generate a route preview (not saved)
router.post('/generate', validateGenerateInput, async (req, res, next) => {
  try {
    const result = await generateRoute(req.validatedGenerate);
    res.json(result);
  } catch (err) {
    console.error('Route generation error:', err.message);
    res.status(502).json({ error: 'Route generation failed. Please try again.' });
  }
});

// GET /api/routes — list all saved routes newest first
router.get('/', (req, res, next) => {
  try {
    const routes = readRoutes();
    const sorted = [...routes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ routes: sorted });
  } catch (err) {
    next(err);
  }
});

// POST /api/routes — save a route
router.post('/', validateSaveInput, (req, res, next) => {
  try {
    const route = {
      id: crypto.randomUUID(),
      ...req.validatedSave,
      createdAt: new Date().toISOString(),
    };
    addRoute(route);
    res.status(201).json(route);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/routes/:id — delete a route
router.delete('/:id', (req, res, next) => {
  try {
    const removed = removeRouteById(req.params.id);
    if (!removed) {
      return res.status(404).json({ error: 'Route not found' });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
