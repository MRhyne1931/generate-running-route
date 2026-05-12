require('dotenv').config();

const config = {
  port: parseInt(process.env.PORT, 10) || 3001,
  orsApiKey: process.env.ORS_API_KEY || '',
};

module.exports = config;
