# 🎬 Inter-NodeJS (PostgreSQL + Neon + Vercel)

Proyek ini merupakan implementasi **Node.js + Express** dengan **database PostgreSQL (Neon)** yang dideploy ke **Vercel**.  
Berisi dua tabel utama — `directors` dan `movies` — serta koneksi otomatis dengan environment variable.

---

## 🚀 Teknologi yang Digunakan

- **Node.js**
- **Express.js**
- **PostgreSQL (Neon Database)**
- **Vercel Deployment**
- **dotenv** (untuk environment variables)
- **pg** (PostgreSQL client)
- **JWT & bcryptjs** (opsional untuk autentikasi)

---

## 📁 Struktur Folder

```
film-intropobilitas/
├── node-js/
│   ├── server.js
│   ├── database.js
│   ├── .env
│   ├── routes/
│   ├── controllers/
│   └── models/
```

---

## ⚙️ Setup Project

### 1. Inisialisasi Project
```bash
npm init -y
npm install express dotenv pg jsonwebtoken bcryptjs cors
```

### 2. Buat File `.env`
Isi dengan data dari Neon Database kamu:

```env
PORT=3300
POSTGRES_URL=postgresql://neondb_owner:password@ep-noisy-mode-ah64h5pl-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=my_super_secret_jwt_key_12345
```

### 3. Buat File `database.js`
```js
require('dotenv').config();
const { Pool } = require('pg');

if (!process.env.POSTGRES_URL) {
  console.error("❌ Error: POSTGRES_URL not found in .env file");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL.replace("postgresql://", "postgres://"),
  ssl: { rejectUnauthorized: false }
});

pool.connect()
  .then(() => console.log("✅ PostgreSQL connected successfully"))
  .catch(err => console.error("❌ Database connection error:", err.stack));

module.exports = pool;
```

### 4. Buat File `server.js`
```js
const express = require('express');
const cors = require('cors');
const pool = require('./database');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => res.send('🎬 API is running'));

// GET all movies
app.get('/movies', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM movies');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all directors
app.get('/directors', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM directors');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3300;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
```

---

## 🧱 Struktur Database

### Tabel `directors`
| Kolom | Tipe Data | Keterangan |
|-------|------------|------------|
| id | SERIAL PRIMARY KEY | ID unik sutradara |
| name | VARCHAR(100) | Nama sutradara |
| country | VARCHAR(100) | Asal negara |

### Tabel `movies`
| Kolom | Tipe Data | Keterangan |
|-------|------------|------------|
| id | SERIAL PRIMARY KEY | ID unik film |
| title | VARCHAR(100) | Judul film |
| year | INT | Tahun rilis |
| director_id | INT REFERENCES directors(id) | Relasi ke sutradara |

---

## 📦 Menjalankan Project

```bash
node server.js
```
Atau gunakan **nodemon** agar otomatis restart:
```bash
npx nodemon server.js
```

Server akan berjalan di:  
👉 `http://localhost:3300`

---

## 🌐 Deployment ke Vercel

1. Push ke GitHub
2. Hubungkan repo ke Vercel
3. Tambahkan environment variables di dashboard Vercel:
   - `POSTGRES_URL`
   - `JWT_SECRET`
4. Deploy! 🚀

---

## ✅ Endpoint API

| Endpoint | Method | Deskripsi |
|-----------|---------|------------|
| `/` | GET | Cek apakah server hidup |
| `/movies` | GET | Menampilkan semua film |
| `/directors` | GET | Menampilkan semua sutradara |

---

## 🧠 Error Umum & Solusi

| Error | Penyebab | Solusi |
|--------|-----------|--------|
| `password authentication failed for user 'user'` | URL salah di `.env` | Cek username & password Neon |
| `relation "movies" does not exist` | Tabel belum dibuat | Jalankan query CREATE TABLE di Neon |
| `getaddrinfo ENOTFOUND` | URL salah format | Pastikan awalan `postgresql://` bukan `psql` |

---

## ✨ Penutup

Kini kamu sudah berhasil:
- Menghubungkan Node.js ke PostgreSQL Neon  
- Membuat endpoint `/movies` dan `/directors`  
- Men-deploy ke Vercel 🎉

---

**Dibuat oleh:** Yushril Huda  
📅 2025  