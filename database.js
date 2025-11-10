require('dotenv').config();
const { Pool } = require('pg');

// Pastikan variabel environment tersedia
if (!process.env.POSTGRES_URL) {
  console.error("❌ Error: POSTGRES_URL not found in .env file");
  process.exit(1);
}

// Buat koneksi ke PostgreSQL
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL.replace("postgresql://", "postgres://"), // antisipasi format dari Vercel
  ssl: { rejectUnauthorized: false }, // wajib true kalau connect dari hosting seperti Vercel
});

// Tes koneksi database
pool.connect()
  .then(() => console.log("✅ PostgreSQL connected successfully"))
  .catch(err => console.error("❌ Database connection error:", err.stack));

// Ekspor pool supaya bisa dipakai di file lain
module.exports = pool;