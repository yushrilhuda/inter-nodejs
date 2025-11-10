require('dotenv').config();
const { Pool } = require('pg');

// Pastikan environment variable tersedia
if (!process.env.POSTGRES_URL) {
  console.error("❌ Error: POSTGRES_URL not found in .env file");
  process.exit(1);
}

// Buat koneksi pool ke PostgreSQL
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL.replace("postgresql://", "postgres://"), // antisipasi format dari provider
  ssl: { rejectUnauthorized: false } // penting untuk koneksi di Vercel / Neon / Supabase
});

// Tes koneksi database
pool.connect()
  .then(() => console.log("✅ PostgreSQL connected successfully"))
  .catch(err => console.error("❌ Database connection error:", err.stack));

// Ekspor pool untuk digunakan di file lain
module.exports = pool;