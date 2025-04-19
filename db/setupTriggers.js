const fs = require('fs');
const path = require('path');
const pool = require('./index');

async function setupTriggers() {
  try {
    const sql = fs.readFileSync(path.join(__dirname, '../triggers.sql'), 'utf-8');
    await pool.query(sql);
    console.log('Database triggers and functions set up successfully.');
  } catch (err) {
    console.error('Error setting up database triggers:', err);
  }
}

module.exports = setupTriggers;
