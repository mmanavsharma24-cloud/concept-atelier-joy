const pool = require('./config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    const migrationFile = path.join(__dirname, 'migrations', 'add_subtasks.sql');
    const sql = fs.readFileSync(migrationFile, 'utf8');
    
    console.log('Running migration: add_subtasks.sql');
    await pool.query(sql);
    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
