'use strict';

const config = require('./config/env.config');
const app = require('./app');
const { connectPool } = require('./db/pool');

const startServer = async () => {
  try {
    await connectPool();
  } catch (err) {
    console.error('[DB] Connection failed:', err.message);
    process.exit(1);
  }

  app.listen(config.port, () => {
    console.log(`Listening on port ${config.port}`);
  });
};

startServer();
