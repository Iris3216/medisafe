const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.RDS_HOSTNAME,
  port: process.env.RDS_PORT || 5432,
  database: process.env.RDS_DB_NAME,
  user: process.env.RDS_USERNAME,
  password: process.env.RDS_PASSWORD,
  max: 10,
  idleTimeoutMillis: 30000,
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Database error:', err);
});

module.exports = pool;