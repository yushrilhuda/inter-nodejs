// Load environment variables dari file .env
require('dotenv').config();

// Import Pool dari pg (PostgreSQL client)
const { Pool } = require('pg');

// Buat koneksi pool ke database PostgreSQL
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL, // pastikan nama variable sesuai dengan yang ada di .env dan Vercel
  ssl: {
    rejectUnauthorized: false, // penting untuk koneksi ke PostgreSQL di Vercel / Railway / Supabase
  },
});

// Cek koneksi untuk memastikan berhasil
pool.connect()
  .then(() => console.log('✅ Database PostgreSQL connected successfully'))
  .catch(err => console.error('❌ Database connection error:', err.stack));

// Ekspor pool agar bisa digunakan di file lain
module.exports = pool;