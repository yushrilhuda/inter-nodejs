require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const DBSOURCE_1 = process.env.DB_SOURCE_1;
const DBSOURCE_2 = process.env.DB_SOURCE_2;

// Membuat koneksi pertama ke database untuk tabel 'movies' dan 'users'
const dbMovies = new sqlite3.Database(DBSOURCE_1, (err) => {
  if (err) {
    console.error("Error:", err.message);
    throw err;
  }

  console.log(`Berhasil terhubung ke database: ${DBSOURCE_1}`);
  
  // Tabel movies
  dbMovies.run(
    `CREATE TABLE IF NOT EXISTS movies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      director TEXT NOT NULL,
      year INTEGER NOT NULL
    )`,
    (err) => {
      if (!err) {
        console.log("Tabel 'movies' berhasil dibuat.");
        // Cek apakah sudah ada data
        dbMovies.get("SELECT COUNT(*) as count FROM movies", (err, row) => {
          if (!err && row.count === 0) {
            console.log("Memasukkan data awal movies...");
            const insert = 'INSERT INTO movies (title, director, year) VALUES (?,?,?)';
            dbMovies.run(insert, ["The Lord of the Rings", "Peter Jackson", 2001]);
            dbMovies.run(insert, ["The Avengers", "Joss Whedon", 2012]);
          }
        });
      } else {
        console.log("Tabel 'movies' sudah ada.");
      }
    }
  );

  // Tabel users untuk autentikasi
  dbMovies.run(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    )`,
    (err) => {
      if (err) {
        console.error("Gagal membuat tabel users:", err.message);
      } else {
        console.log("Tabel 'users' berhasil dibuat/sudah ada.");
      }
    }
  );
});

// Membuat koneksi kedua ke database untuk tabel 'directors'
const dbDirectors = new sqlite3.Database(DBSOURCE_2, (err) => {
  if (err) {
    console.error("Error:", err.message);
    throw err;
  }
  
  console.log(`Berhasil terhubung ke database: ${DBSOURCE_2}`);
  
  dbDirectors.run(
    `CREATE TABLE IF NOT EXISTS directors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      birthYear INTEGER NOT NULL
    )`,
    (err) => {
      if (!err) {
        console.log("Tabel 'directors' berhasil dibuat.");
        // Cek apakah sudah ada data
        dbDirectors.get("SELECT COUNT(*) as count FROM directors", (err, row) => {
          if (!err && row.count === 0) {
            console.log("Memasukkan data awal directors...");
            const insert = 'INSERT INTO directors (name, birthYear) VALUES (?,?)';
            dbDirectors.run(insert, ["Moh. Jevon Attaillah", 2005]);
            dbDirectors.run(insert, ["Mima Hayatun Nikma", 1981]);
            dbDirectors.run(insert, ["Ferry Prayitno", 1981]);
          }
        });
      } else {
        console.log("Tabel 'directors' sudah ada.");
      }
    }
  );
});

// Ekspor kedua objek koneksi
module.exports = {
    dbMovies,
    dbDirectors
};