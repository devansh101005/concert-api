const fs = require('fs');
const path = require('path');
const pool = require('./index');

async function runMigration() {
  try {
    console.log('Running staff_id migration...');
    const sql = fs.readFileSync(path.join(__dirname, '../migrations/update_staff_id_serial.sql'), 'utf-8');
    await pool.query(sql);
    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Error running migration:', err);
  } finally {
    // Close the pool to allow the script to exit
    await pool.end();
  }
}

// Run the migration if this file is executed directly
if (require.main === module) {
  runMigration();
}

module.exports = runMigration;