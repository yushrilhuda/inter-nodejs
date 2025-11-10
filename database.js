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

// Fungsi setup database
async function setupDatabase() {
  const client = await pool.connect();

  try {
    console.log("✅ PostgreSQL connected successfully");

    // Buat tabel directors
    await client.query(`
      CREATE TABLE IF NOT EXISTS directors (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        birth_year INT,
        nationality VARCHAR(100)
      );
    `);

    // Buat tabel movies
    await client.query(`
      CREATE TABLE IF NOT EXISTS movies (
        id SERIAL PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        year INT,
        genre VARCHAR(50),
        director_id INT REFERENCES directors(id) ON DELETE SET NULL
      );
    `);

    console.log("✅ Tables ensured: directors & movies");

    // Cek apakah directors kosong
    const { rows } = await client.query('SELECT COUNT(*) FROM directors');
    if (parseInt(rows[0].count) === 0) {
      await client.query(`
        INSERT INTO directors (name, birth_year, nationality)
        VALUES
        ('Christopher Nolan', 1970, 'British-American'),
        ('Steven Spielberg', 1946, 'American'),
        ('Hayao Miyazaki', 1941, 'Japanese'),
        ('Quentin Tarantino', 1963, 'American');
      `);
      console.log("✅ Sample directors data inserted");
    } else {
      console.log("ℹ️ Directors table already has data");
    }

  } catch (err) {
    console.error("❌ Database setup error:", err.stack);
  } finally {
    client.release();
  }
}

// Jalankan setup saat pertama kali
setupDatabase();

// Ekspor pool untuk digunakan di file lain
module.exports = pool;