'use strict';

const { Pool } = require('pg');
const config = require('../config/env.config');

const pool = new Pool({
  connectionString: config.postgresConnectionString,
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected pool error:', err.message);
});

const connectPool = async () => {
  const client = await pool.connect();
  client.release();
  console.log('[DB] DB connected');
};

module.exports = { pool, connectPool };
