const express = require('express');
const cors = require('cors');
const config = require('./config');
const routesRouter = require('./routes/routes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.use('/api/routes', routesRouter);

// Global error handler
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(config.port, () => {
  console.log(`Backend running on port ${config.port}`);
});

module.exports = app;
