const METERS_PER_MILE = 1609.344;

function validateGenerateInput(req, res, next) {
  const { requestedDistanceMiles, startLat, startLng } = req.body;

  if (requestedDistanceMiles === undefined || requestedDistanceMiles === null) {
    return res.status(400).json({ error: 'requestedDistanceMiles is required' });
  }
  const dist = Number(requestedDistanceMiles);
  if (isNaN(dist) || dist < 0.5 || dist > 26.2) {
    return res.status(400).json({ error: 'requestedDistanceMiles must be between 0.5 and 26.2' });
  }

  if (startLat === undefined || startLat === null) {
    return res.status(400).json({ error: 'startLat is required' });
  }
  const lat = Number(startLat);
  if (isNaN(lat) || lat < -90 || lat > 90) {
    return res.status(400).json({ error: 'startLat must be a number between -90 and 90' });
  }

  if (startLng === undefined || startLng === null) {
    return res.status(400).json({ error: 'startLng is required' });
  }
  const lng = Number(startLng);
  if (isNaN(lng) || lng < -180 || lng > 180) {
    return res.status(400).json({ error: 'startLng must be a number between -180 and 180' });
  }

  req.validatedGenerate = { requestedDistanceMiles: dist, startLat: lat, startLng: lng };
  next();
}

function validateSaveInput(req, res, next) {
  const { title, requestedDistanceMiles, actualDistanceMiles, startLocation, path } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({ error: 'title is required' });
  }
  if (title.length > 255) {
    return res.status(400).json({ error: 'title must be 255 characters or fewer' });
  }

  const reqDist = Number(requestedDistanceMiles);
  if (isNaN(reqDist) || reqDist < 0.5 || reqDist > 26.2) {
    return res.status(400).json({ error: 'requestedDistanceMiles must be between 0.5 and 26.2' });
  }

  const actDist = Number(actualDistanceMiles);
  if (isNaN(actDist) || actDist <= 0) {
    return res.status(400).json({ error: 'actualDistanceMiles must be a positive number' });
  }

  if (!startLocation || typeof startLocation !== 'object') {
    return res.status(400).json({ error: 'startLocation is required' });
  }
  const lat = Number(startLocation.lat);
  const lng = Number(startLocation.lng);
  if (isNaN(lat) || lat < -90 || lat > 90) {
    return res.status(400).json({ error: 'startLocation.lat must be between -90 and 90' });
  }
  if (isNaN(lng) || lng < -180 || lng > 180) {
    return res.status(400).json({ error: 'startLocation.lng must be between -180 and 180' });
  }

  if (!path || path.type !== 'LineString' || !Array.isArray(path.coordinates) || path.coordinates.length < 2) {
    return res.status(400).json({ error: 'path must be a valid GeoJSON LineString with at least 2 coordinates' });
  }

  req.validatedSave = {
    title: title.trim(),
    requestedDistanceMiles: reqDist,
    actualDistanceMiles: actDist,
    startLocation: { address: startLocation.address || null, lat, lng },
    path,
  };
  next();
}

module.exports = { validateGenerateInput, validateSaveInput, METERS_PER_MILE };
