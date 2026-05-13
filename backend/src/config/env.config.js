'use strict';

const dotenv = require('dotenv');

dotenv.config();

const REQUIRED_VARS = ['JWT_SECRET', 'POSTGRES_CONNECTION_STRING'];

const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`[env.config] Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  postgresConnectionString: process.env.POSTGRES_CONNECTION_STRING,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};

module.exports = config;
