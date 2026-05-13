'use strict';

const { pool } = require('../db/pool');
const { toCamel } = require('../utils/db.utils');

async function findById(userId) {
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE id = $1',
    [userId]
  );
  return toCamel(rows[0]) || null;
}

async function updateName(userId, name) {
  const { rows } = await pool.query(
    `UPDATE users SET name = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, email, name, created_at, updated_at`,
    [name, userId]
  );
  return toCamel(rows[0]);
}

async function updatePassword(userId, hashedPassword) {
  await pool.query(
    'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
    [hashedPassword, userId]
  );
}

module.exports = { findById, updateName, updatePassword };
