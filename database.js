require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const DBSOURCE_1 = process.env.DB_SOURCE_1;
const DBSOURCE_2 = process.env.DB_SOURCE_2;

// Membuat koneksi pertama ke database untuk tabel 'movies'
const dbMovies = new sqlite3.Database(DBSOURCE_1, (err) => {
  if (err) {
    console.error("Error:", err.message);
    throw err;
  }
  console.log(`Berhasil terhubung ke database: ${DBSOURCE_1}`);
  dbMovies.run(
    `CREATE TABLE IF NOT EXISTS movies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      director TEXT NOT NULL,
      year INTEGER NOT NULL
    )`,
    (err) => {
      if (!err) {
        console.log("Tabel 'movies' berhasil dibuat. Memasukkan data awal...");
        const insert = 'INSERT INTO movies (title, director, year) VALUES (?,?,?)';
        dbMovies.run(insert, ["The Lord of the Rings", "Peter Jackson", 2001]);
        dbMovies.run(insert, ["The Avengers", "Joss Whedon", 2012]);
      } else {
        console.log("Tabel 'movies' sudah ada.");
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
        console.log("Tabel 'directors' berhasil dibuat. Memasukkan data awal...");
        const insert = 'INSERT INTO directors (name, birthYear) VALUES (?,?)';
        dbDirectors.run(insert, ["Moh. Jevon Attaillah", 2005]);
        dbDirectors.run(insert, ["Mima Hayatun Nikma", 1981]);
        dbDirectors.run(insert, ["Ferry Prayitno", 1981]);
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

// const db = new sqlite3.Database(DBSOURCE, (err) => {
//     if (err) {
//         console.error(err.message);
//         throw err;
//     } else {
//         console.log('Connected to the SQLite database.');
//         db.run(
//             `CREATE TABLE IF NOT EXISTS movies (
//                 id INTEGER PRIMARY KEY AUTOINCREMENT,
//                 title TEXT NOT NULL,
//                 director TEXT NOT NULL,
//                 year INTEGER NOT NULL
//             )`,
//             (err) => {
//                 if (!err) {
//                     console.log("Table 'movies' created. Seeding initial data...");
//                     const insert = 'INSERT INTO movies (title, director, year) VALUES (?,?,?)';
//                     db.run(insert, ["The Lord of the Rings", "Peter Jackson", 2001]);
//                     db.run(insert, ["The Avengers", "Joss Whedon", 2012]);
//                     db.run(insert, ["Spider-Man", "Sam Raimi", 2002]);
//                 } else {
//                     console.log("Table 'movies' already exists.");
//                 }
//             }
//         );
//     }
// });

// module.exports = db;