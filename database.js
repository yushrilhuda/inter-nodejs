require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL, // ✅ benar
  ssl: {
    rejectUnauthorized: false,
  },
});