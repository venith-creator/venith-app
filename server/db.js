/*const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'inventory_db',
    password: 'Pat$2005',
    port: 5432,
});

module.exports = pool;
*/
require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'your-local-db-url',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

module.exports = pool;
