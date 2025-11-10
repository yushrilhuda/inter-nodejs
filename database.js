// database.js
require('dotenv').config();
const { Pool } = require('pg');

// Buat koneksi ke PostgreSQL
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false, // penting untuk deploy di Vercel, Supabase, Railway, dsb.
  },
});

// Cek koneksi
pool.connect()
  .then(() => console.log('✅ Database PostgreSQL connected successfully'))
  .catch(err => console.error('❌ Database connection error:', err.stack));

// Ekspor pool agar bisa digunakan di file lain
module.exports = pool;