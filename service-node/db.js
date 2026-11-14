const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'simrs_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
  max: 20, // Connection pool limit for high-throughput analytics (Scenario D.6)
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client in Node.js service', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
  pool,
};
