'use strict';

const { pool } = require('../db/pool');
const { toCamel } = require('../utils/db.utils');

// filters: { categoryId, isCompleted, dueDateFrom, dueDateTo }
async function findAllByUser(userId, filters = {}) {
  const conditions = ['user_id = $1'];
  const params = [userId];
  let idx = 2;

  if (filters.categoryId !== undefined) {
    conditions.push(`category_id = $${idx++}`);
    params.push(filters.categoryId);
  }
  if (filters.isCompleted !== undefined) {
    conditions.push(`is_completed = $${idx++}`);
    params.push(filters.isCompleted);
  }
  if (filters.dueDateFrom !== undefined) {
    conditions.push(`due_date >= $${idx++}`);
    params.push(filters.dueDateFrom);
  }
  if (filters.dueDateTo !== undefined) {
    conditions.push(`due_date <= $${idx++}`);
    params.push(filters.dueDateTo);
  }

  const where = conditions.join(' AND ');
  const { rows } = await pool.query(
    `SELECT * FROM todos WHERE ${where} ORDER BY created_at DESC`,
    params
  );
  return rows.map(toCamel);
}

async function findById(todoId) {
  const { rows } = await pool.query('SELECT * FROM todos WHERE id = $1', [todoId]);
  return toCamel(rows[0]) || null;
}

async function create(userId, categoryId, title, description, dueDate) {
  const { rows } = await pool.query(
    `INSERT INTO todos (user_id, category_id, title, description, due_date)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [userId, categoryId, title, description || null, dueDate || null]
  );
  return toCamel(rows[0]);
}

// fields: { title, description, dueDate, categoryId, isCompleted }
async function update(todoId, fields) {
  const setClauses = [];
  const params = [];
  let idx = 1;

  if (fields.title !== undefined) { setClauses.push(`title = $${idx++}`); params.push(fields.title); }
  if (fields.description !== undefined) { setClauses.push(`description = $${idx++}`); params.push(fields.description); }
  if ('dueDate' in fields) { setClauses.push(`due_date = $${idx++}`); params.push(fields.dueDate || null); }
  if (fields.categoryId !== undefined) { setClauses.push(`category_id = $${idx++}`); params.push(fields.categoryId); }
  if (fields.isCompleted !== undefined) { setClauses.push(`is_completed = $${idx++}`); params.push(fields.isCompleted); }

  setClauses.push(`updated_at = NOW()`);
  params.push(todoId);

  const { rows } = await pool.query(
    `UPDATE todos SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *`,
    params
  );
  return toCamel(rows[0]);
}

async function deleteById(todoId) {
  await pool.query('DELETE FROM todos WHERE id = $1', [todoId]);
}

module.exports = { findAllByUser, findById, create, update, deleteById };
