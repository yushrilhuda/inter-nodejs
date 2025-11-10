require('dotenv').config();
const { Pool } = require('pg');

// Pastikan environment variable tersedia
if (!process.env.POSTGRES_URL) {
  console.error("❌ Error: POSTGRES_URL not found in .env file");
  process.exit(1);
}

// Buat koneksi pool ke PostgreSQL
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL.replace("postgresql://", "postgres://"),
  ssl: { rejectUnauthorized: false } // penting untuk koneksi di Vercel / Neon / Supabase
});

// Tes koneksi database dan buat tabel jika belum ada
pool.connect()
  .then(async (client) => {
    console.log("✅ PostgreSQL connected successfully");

    // Buat tabel movies
    await client.query(`
      CREATE TABLE IF NOT EXISTS movies (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        director_id INT,
        year INT,
        genre VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Buat tabel directors
    await client.query(`
      CREATE TABLE IF NOT EXISTS directors (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        birth_year INT,
        nationality VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tambahkan relasi (opsional)
    await client.query(`
      ALTER TABLE movies
      ADD CONSTRAINT fk_director
      FOREIGN KEY (director_id)
      REFERENCES directors(id)
      ON DELETE SET NULL;
    `).catch(() => {}); // kalau constraint sudah ada, abaikan errornya

    console.log("✅ Tables 'movies' and 'directors' are ready");

    client.release();
  })
  .catch(err => console.error("❌ Database connection error:", err.stack));

// Ekspor pool untuk digunakan di file lain
module.exports = pool;