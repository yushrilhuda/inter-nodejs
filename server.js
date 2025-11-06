require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Import kedua database
const { dbMovies, dbDirectors } = require('./database');

const app = express();
const PORT = process.env.PORT || 3300;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors());
app.use(express.json());

// === AUTH ROUTES ===

app.post('/auth/register', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password || password.length < 6) {
    return res.status(400).json({ 
      error: 'Username dan password (min 6 char) harus diisi' 
    });
  }

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error("Error hashing:", err);
      return res.status(500).json({ error: 'Gagal memproses pendaftaran' });
    }

    const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
    const params = [username.toLowerCase(), hashedPassword];

    // PENTING: Gunakan dbMovies karena tabel users ada di database pertama
    dbMovies.run(sql, params, function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint')) {
          return res.status(409).json({ error: 'Username sudah digunakan' });
        }
        console.error("Error inserting user:", err);
        return res.status(500).json({ error: 'Gagal menyimpan pengguna' });
      }
      
      res.status(201).json({ 
        message: 'Registrasi berhasil', 
        userId: this.lastID 
      });
    });
  });
});

app.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username dan password harus diisi' });
  }

  const sql = "SELECT * FROM users WHERE username = ?";
  
  // PENTING: Gunakan dbMovies untuk query users
  dbMovies.get(sql, [username.toLowerCase()], (err, user) => {
    if (err || !user) {
      return res.status(401).json({ error: 'Kredensial tidak valid' });
    }

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err || !isMatch) {
        return res.status(401).json({ error: 'Kredensial tidak valid' });
      }

      const payload = { 
        user: { 
          id: user.id, 
          username: user.username 
        } 
      };

      jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
        if (err) {
          console.error("Error signing token:", err);
          return res.status(500).json({ error: 'Gagal membuat token' });
        }
        
        res.json({ 
          message: 'Login berhasil', 
          token: token 
        });
      });
    });
  });
});

// === MOVIES ROUTES ===

// GET semua movies (public)
app.get('/movies', (req, res) => {
  const sql = "SELECT * FROM movies";
  dbMovies.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ data: rows });
  });
});

// GET movie by ID (public)
app.get('/movies/:id', (req, res) => {
  const sql = "SELECT * FROM movies WHERE id = ?";
  dbMovies.get(sql, [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Movie tidak ditemukan' });
    }
    res.json({ data: row });
  });
});

// Import middleware
const authenticateToken = require('./middleware/authMiddleware');

// POST movie (protected - perlu login)
app.post('/movies', authenticateToken, (req, res) => {
  console.log('Request POST /movies oleh user:', req.user.username);
  
  const { title, director, year } = req.body;
  
  if (!title || !director || !year) {
    return res.status(400).json({ error: 'Semua field harus diisi' });
  }

  const sql = 'INSERT INTO movies (title, director, year) VALUES (?, ?, ?)';
  dbMovies.run(sql, [title, director, year], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ 
      message: 'Movie berhasil ditambahkan', 
      movieId: this.lastID 
    });
  });
});

// PUT movie (protected - perlu login)
app.put('/movies/:id', authenticateToken, (req, res) => {
  console.log('Request PUT /movies/:id oleh user:', req.user.username);
  
  const { title, director, year } = req.body;
  
  const sql = 'UPDATE movies SET title = ?, director = ?, year = ? WHERE id = ?';
  dbMovies.run(sql, [title, director, year, req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Movie tidak ditemukan' });
    }
    res.json({ message: 'Movie berhasil diupdate' });
  });
});

// DELETE movie (protected - perlu login)
app.delete('/movies/:id', authenticateToken, (req, res) => {
  console.log('Request DELETE /movies/:id oleh user:', req.user.username);
  
  const sql = 'DELETE FROM movies WHERE id = ?';
  dbMovies.run(sql, [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Movie tidak ditemukan' });
    }
    res.json({ message: 'Movie berhasil dihapus' });
  });
});

// === DIRECTORS ROUTES ===

// GET semua directors (public)
app.get('/directors', (req, res) => {
  const sql = "SELECT * FROM directors";
  dbDirectors.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ data: rows });
  });
});

// GET director by ID (public)
app.get('/directors/:id', (req, res) => {
  const sql = "SELECT * FROM directors WHERE id = ?";
  dbDirectors.get(sql, [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Director tidak ditemukan' });
    }
    res.json({ data: row });
  });
});

// POST director (protected - perlu login)
app.post('/directors', authenticateToken, (req, res) => {
  console.log('Request POST /directors oleh user:', req.user.username);
  
  const { name, birthYear } = req.body;
  
  if (!name || !birthYear) {
    return res.status(400).json({ error: 'Name dan birthYear harus diisi' });
  }

  const sql = 'INSERT INTO directors (name, birthYear) VALUES (?, ?)';
  dbDirectors.run(sql, [name, birthYear], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ 
      message: 'Director berhasil ditambahkan', 
      directorId: this.lastID 
    });
  });
});

// PUT director (protected - perlu login)
app.put('/directors/:id', authenticateToken, (req, res) => {
  console.log('Request PUT /directors/:id oleh user:', req.user.username);
  
  const { name, birthYear } = req.body;
  
  const sql = 'UPDATE directors SET name = ?, birthYear = ? WHERE id = ?';
  dbDirectors.run(sql, [name, birthYear, req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Director tidak ditemukan' });
    }
    res.json({ message: 'Director berhasil diupdate' });
  });
});

// DELETE director (protected - perlu login)
app.delete('/directors/:id', authenticateToken, (req, res) => {
  console.log('Request DELETE /directors/:id oleh user:', req.user.username);
  
  const sql = 'DELETE FROM directors WHERE id = ?';
  dbDirectors.run(sql, [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Director tidak ditemukan' });
    }
    res.json({ message: 'Director berhasil dihapus' });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});