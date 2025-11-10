// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./database');
const authenticateToken = require('./middleware/authMiddleware');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors());
app.use(express.json());

// === ROOT ROUTE ===
app.get('/', (req, res) => {
  res.send('🚀 API is running successfully! PostgreSQL connection active.');
});

// === AUTH ROUTES ===
app.post('/auth/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password || password.length < 6) {
    return res.status(400).json({ error: 'Username dan password (min 6 char) harus diisi' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id',
      [username.toLowerCase(), hashedPassword]
    );
    res.status(201).json({ message: 'Registrasi berhasil', userId: result.rows[0].id });
  } catch (err) {
    if (err.message.includes('duplicate key')) {
      return res.status(409).json({ error: 'Username sudah digunakan' });
    }
    res.status(500).json({ error: 'Gagal menyimpan pengguna' });
  }
});

app.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username dan password harus diisi' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username.toLowerCase()]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Kredensial tidak valid' });
    }

    const payload = { user: { id: user.id, username: user.username } };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    res.json({ message: 'Login berhasil', token });
  } catch (err) {
    res.status(500).json({ error: 'Gagal memproses login' });
  }
});

// === MOVIES ROUTES ===
app.get('/movies', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM movies');
    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/movies/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM movies WHERE id = $1', [req.params.id]);
    const movie = result.rows[0];
    if (!movie) return res.status(404).json({ error: 'Movie tidak ditemukan' });
    res.json({ data: movie });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/movies', authenticateToken, async (req, res) => {
  const { title, director, year } = req.body;
  if (!title || !director || !year) {
    return res.status(400).json({ error: 'Semua field harus diisi' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO movies (title, director, year) VALUES ($1, $2, $3) RETURNING id',
      [title, director, year]
    );
    res.status(201).json({ message: 'Movie berhasil ditambahkan', movieId: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/movies/:id', authenticateToken, async (req, res) => {
  const { title, director, year } = req.body;

  try {
    const result = await pool.query(
      'UPDATE movies SET title = $1, director = $2, year = $3 WHERE id = $4',
      [title, director, year, req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Movie tidak ditemukan' });
    res.json({ message: 'Movie berhasil diupdate' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/movies/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM movies WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Movie tidak ditemukan' });
    res.json({ message: 'Movie berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === DIRECTORS ROUTES ===
app.get('/directors', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM directors');
    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/directors/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM directors WHERE id = $1', [req.params.id]);
    const director = result.rows[0];
    if (!director) return res.status(404).json({ error: 'Director tidak ditemukan' });
    res.json({ data: director });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/directors', authenticateToken, async (req, res) => {
  const { name, birthYear } = req.body;
  if (!name || !birthYear) {
    return res.status(400).json({ error: 'Name dan birthYear harus diisi' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO directors (name, birthYear) VALUES ($1, $2) RETURNING id',
      [name, birthYear]
    );
    res.status(201).json({ message: 'Director berhasil ditambahkan', directorId: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/directors/:id', authenticateToken, async (req, res) => {
  const { name, birthYear } = req.body;

  try {
    const result = await pool.query(
      'UPDATE directors SET name = $1, birthYear = $2 WHERE id = $3',
      [name, birthYear, req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Director tidak ditemukan' });
    res.json({ message: 'Director berhasil diupdate' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/directors/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM directors WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Director tidak ditemukan' });
    res.json({ message: 'Director berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === EKSPOR UNTUK VERCEL ===
module.exports = (req, res) => app(req, res);