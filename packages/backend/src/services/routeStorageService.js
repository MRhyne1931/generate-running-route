const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'routes.json');

function readRoutes() {
  if (!fs.existsSync(DATA_FILE)) {
    return [];
  }
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(raw);
}

function writeRoutes(routes) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(routes, null, 2), 'utf8');
}

function addRoute(route) {
  const routes = readRoutes();
  routes.unshift(route);
  writeRoutes(routes);
  return route;
}

function removeRouteById(id) {
  const routes = readRoutes();
  const index = routes.findIndex((r) => r.id === id);
  if (index === -1) {
    return false;
  }
  routes.splice(index, 1);
  writeRoutes(routes);
  return true;
}

module.exports = { readRoutes, writeRoutes, addRoute, removeRouteById };
