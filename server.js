require('dotenv').config();
const { Pool } = require('pg');

// Cek apakah URL database ada
if (!process.env.POSTGRES_URL) {
  console.error("❌ Error: POSTGRES_URL not found in .env file");
  process.exit(1);
}

// Buat koneksi pool PostgreSQL
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL.replace("postgresql://", "postgres://"), // antisipasi format salah
  ssl: { rejectUnauthorized: false }, // penting untuk koneksi dari Vercel
});

// Tes koneksi database
pool.connect()
  .then(() => console.log("✅ PostgreSQL connected successfully"))
  .catch(err => console.error("❌ Database connection error:", err.stack));

// Ekspor pool biar bisa dipakai di file lain
module.exports = pool;