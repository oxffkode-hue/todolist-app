'use strict';

const { pool } = require('../db/pool');
const { toCamel } = require('../utils/db.utils');

async function findAllByUser(userId) {
  const { rows } = await pool.query(
    `SELECT * FROM categories
     WHERE user_id IS NULL OR user_id = $1
     ORDER BY is_default DESC, created_at ASC`,
    [userId]
  );
  return rows.map(toCamel);
}

async function findById(categoryId) {
  const { rows } = await pool.query(
    'SELECT * FROM categories WHERE id = $1',
    [categoryId]
  );
  return toCamel(rows[0]) || null;
}

async function create(userId, name, icon = 'folder') {
  const { rows } = await pool.query(
    `INSERT INTO categories (user_id, name, icon, is_default)
     VALUES ($1, $2, $3, false)
     RETURNING *`,
    [userId, name, icon]
  );
  return toCamel(rows[0]);
}

async function update(categoryId, name, icon) {
  const { rows } = await pool.query(
    `UPDATE categories SET name = $1, icon = $2, updated_at = NOW()
     WHERE id = $3 RETURNING *`,
    [name, icon, categoryId]
  );
  return toCamel(rows[0]);
}

async function deleteById(categoryId) {
  await pool.query('DELETE FROM categories WHERE id = $1', [categoryId]);
}

async function countTodosByCategory(categoryId) {
  const { rows } = await pool.query(
    'SELECT COUNT(*) as count FROM todos WHERE category_id = $1',
    [categoryId]
  );
  return parseInt(rows[0].count, 10);
}

module.exports = {
  findAllByUser,
  findById,
  create,
  update,
  deleteById,
  countTodosByCategory,
};
