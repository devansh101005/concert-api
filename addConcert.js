// addConcert.js
const pool = require('./db');

async function addConcert() {
  try {
    const result = await pool.query(
      'INSERT INTO concert (concert_id, name, date, time) VALUES (10, \'Test Concert\', \'2025-06-01\', \'19:00:00\') RETURNING *'
    );
    console.log('Concert added:', result.rows[0]);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    pool.end();
  }
}

addConcert();