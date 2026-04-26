import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

/* =========================
   PATH & STORAGE
========================= */

const BASE_DIR = process.cwd();
const uploadDir = path.join(BASE_DIR, 'uploads', 'file_pdf');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use('/uploads', express.static(path.join(BASE_DIR, 'uploads')));

/* =========================
   MULTER
========================= */

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const unique = Date.now() + '-' + Math.random().toString(36).substring(2);
    cb(null, unique + '-' + file.originalname);
  }
});

const upload = multer({ storage });

/* =========================
   DATABASE
========================= */

const dbPath = path.join(BASE_DIR, 'repository.db');
const db = new Database(dbPath);

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT,
  name TEXT,
  role TEXT DEFAULT 'student'
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT
);

CREATE TABLE IF NOT EXISTS repository (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  author TEXT,
  nim TEXT,
  year INTEGER,
  file_path TEXT,
  category_id INTEGER,
  status TEXT DEFAULT 'approved',
  uploader_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS menus (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label TEXT,
  url TEXT,
  is_hidden INTEGER DEFAULT 0
);
`);

/* =========================
   SEED
========================= */

db.prepare(`
INSERT OR IGNORE INTO users (username,password,name,role)
VALUES ('admin','admin123','Administrator','admin')
`).run();

const menuCount = db.prepare(`SELECT COUNT(*) as c FROM menus`).get() as any;

if (menuCount.c === 0) {
  const insert = db.prepare(`INSERT INTO menus (label,url,is_hidden) VALUES (?,?,?)`);
  insert.run('Home','/',0);
  insert.run('Browse','/browse',0);
  insert.run('Tentang','/about',0);
}

/* =========================
   AUTH
========================= */

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  const user = db.prepare(
    `SELECT * FROM users WHERE username=? AND password=?`
  ).get(username, password) as any;

  if (!user) {
    return res.status(401).json({ success:false, message:'Login gagal' });
  }

  res.json({
    success:true,
    user:{
      id:user.id,
      username:user.username,
      name:user.name,
      role:user.role
    }
  });
});

app.post('/api/register', (req, res) => {
  const { username, password, name } = req.body;

  try {
    db.prepare(
      `INSERT INTO users (username,password,name) VALUES (?,?,?)`
    ).run(username,password,name);

    res.json({ success:true });
  } catch {
    res.status(400).json({ success:false, message:'User sudah ada' });
  }
});

/* =========================
   MENUS
========================= */

app.get('/api/menus', (_, res) => {
  const data = db.prepare(`SELECT * FROM menus WHERE is_hidden=0`).all();
  res.json(data);
});

/* =========================
   CATEGORIES
========================= */

app.get('/api/categories', (_, res) => {
  res.json(db.prepare(`SELECT * FROM categories`).all());
});

/* =========================
   REPOSITORY LIST
========================= */

app.get('/api/repository', (req, res) => {
  const data = db.prepare(`
    SELECT r.*, c.name as category_name
    FROM repository r
    LEFT JOIN categories c ON r.category_id = c.id
    ORDER BY r.created_at DESC
  `).all();

  res.json(data);
});

/* =========================
   ADD REPOSITORY
========================= */

app.post('/api/repository', upload.single('file'), (req, res) => {
  try {
    const { title, author, nim, year, category_id, uploader_id } = req.body;

    if (!req.file) {
      return res.status(400).json({ message:'File wajib' });
    }

    db.prepare(`
      INSERT INTO repository 
      (title,author,nim,year,file_path,category_id,uploader_id)
      VALUES (?,?,?,?,?,?,?)
    `).run(
      title,
      author,
      nim,
      year,
      req.file.filename,
      category_id || null,
      uploader_id || null
    );

    res.json({ success:true });

  } catch (err:any) {
    res.status(500).json({ message:err.message });
  }
});

/* =========================
   DELETE REPOSITORY
========================= */

app.delete('/api/repository/:id', (req, res) => {
  try {
    const doc = db.prepare(
      `SELECT file_path FROM repository WHERE id=?`
    ).get(req.params.id) as any;

    if (!doc) return res.status(404).json({});

    if (doc.file_path) {
      const filePath = path.join(uploadDir, doc.file_path);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    db.prepare(`DELETE FROM repository WHERE id=?`).run(req.params.id);

    res.json({ success:true });

  } catch (err:any) {
    res.status(500).json({ message:err.message });
  }
});

/* =========================
   STATS
========================= */

app.get('/api/stats', (_, res) => {
  const total = db.prepare(`SELECT COUNT(*) as c FROM repository`).get() as any;
  res.json({ total: total.c });
});

/* =========================
   START
========================= */

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});