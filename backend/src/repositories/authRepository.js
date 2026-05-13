'use strict';

const { pool } = require('../db/pool');
const { toCamel } = require('../utils/db.utils');

async function findByEmail(email) {
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return toCamel(rows[0]) || null;
}

async function findById(userId) {
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE id = $1',
    [userId]
  );
  return toCamel(rows[0]) || null;
}

async function createUser(email, hashedPassword, name) {
  const { rows } = await pool.query(
    `INSERT INTO users (email, password, name)
     VALUES ($1, $2, $3)
     RETURNING id, email, name, created_at, updated_at`,
    [email, hashedPassword, name]
  );
  return toCamel(rows[0]);
}

async function deleteUser(userId) {
  await pool.query('DELETE FROM users WHERE id = $1', [userId]);
}

module.exports = { findByEmail, findById, createUser, deleteUser };
