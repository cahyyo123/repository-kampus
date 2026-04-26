import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'uploads', 'file_pdf');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Fallback for old mismatched image paths
app.get('/uploads/:filename', (req, res, next) => {
  const filePdfPath = path.join(__dirname, 'uploads', 'file_pdf', req.params.filename);
  if (fs.existsSync(filePdfPath)) {
    res.sendFile(filePdfPath);
  } else {
    next();
  }
});

// Configure Multer for PDF uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['application/pdf', 'video/mp4', 'application/zip', 'application/x-zip-compressed', 'application/x-rar-compressed'];
    if (allowedMimes.includes(file.mimetype) || file.originalname.match(/\.(pdf|mp4|zip|rar)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Format file tidak didukung! Hanya PDF, MP4, ZIP, dan RAR.'));
    }
  },
});

// Database Setup
const db = new Database('repository.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    name TEXT,
    role TEXT DEFAULT 'student',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    logo_url TEXT
  );

  CREATE TABLE IF NOT EXISTS repository (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    document_code TEXT UNIQUE,
    title TEXT,
    author TEXT,
    nim TEXT,
    year INTEGER,
    abstract TEXT,
    keywords TEXT,
    category_id INTEGER,
    file_path TEXT,
    file_bab1 TEXT,
    file_bab2 TEXT,
    file_bab3 TEXT,
    file_bab4 TEXT,
    file_bab5 TEXT,
    external_link TEXT,
    status TEXT DEFAULT 'pending',
    admin_comment TEXT,
    uploader_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (uploader_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS access_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    document_id INTEGER,
    requester_email TEXT,
    requester_name TEXT,
    reason TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES repository(id)
  );

  CREATE TABLE IF NOT EXISTS pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    is_hidden BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS menus (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    label TEXT NOT NULL,
    url TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    is_hidden BOOLEAN DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS site_settings (
    setting_key TEXT PRIMARY KEY,
    setting_value TEXT
  );
`);

try { db.exec('ALTER TABLE users ADD COLUMN role TEXT DEFAULT "student"'); } catch (e) {}
try { db.exec('ALTER TABLE users ADD COLUMN email TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE categories ADD COLUMN logo_url TEXT'); } catch (e) {}
try { 
  db.exec('ALTER TABLE users ADD COLUMN created_at DATETIME'); 
  db.exec('UPDATE users SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL');
} catch (e) {}
try { db.exec("UPDATE users SET role = 'admin' WHERE username = 'admin'"); } catch (e) {}
try { db.exec('ALTER TABLE repository ADD COLUMN external_link TEXT'); } catch (e) {}
try { db.exec("ALTER TABLE repository ADD COLUMN status TEXT DEFAULT 'pending'"); } catch (e) {}
try { db.exec('ALTER TABLE repository ADD COLUMN admin_comment TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE repository ADD COLUMN uploader_id INTEGER'); } catch (e) {}
try { db.exec('ALTER TABLE repository ADD COLUMN file_bab1 TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE repository ADD COLUMN file_bab2 TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE repository ADD COLUMN file_bab3 TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE repository ADD COLUMN file_bab4 TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE repository ADD COLUMN file_bab5 TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE repository ADD COLUMN custom_files TEXT DEFAULT "[]"'); } catch (e) {}
try { db.exec('ALTER TABLE repository ADD COLUMN file_path_label TEXT'); } catch (e) {}
try { 
  db.exec('ALTER TABLE pages ADD COLUMN created_at DATETIME'); 
  db.exec('UPDATE pages SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL');
} catch (e) {}

// Seed default menus
const menuCountRaw = db.prepare('SELECT COUNT(*) as count FROM menus').get();
if ((menuCountRaw as any).count === 0) {
  const insertMenu = db.prepare('INSERT INTO menus (label, url, order_index, is_hidden) VALUES (?, ?, ?, ?)');
  insertMenu.run('Home', '/', 1, 0);
  insertMenu.run('Browse', '/browse', 2, 0);
  insertMenu.run('Tentang', '/about', 3, 0);
}

// Seed default settings
const settingCount = db.prepare('SELECT COUNT(*) as count FROM site_settings').get();
if ((settingCount as any).count === 0) {
  const insertSetting = db.prepare('INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)');
  insertSetting.run('site_title', 'RepoKampus');
  insertSetting.run('site_description', 'Repository Institusi dan Karya Ilmiah Kampus');
  insertSetting.run('theme_color', '#4f46e5'); // Indigo 600
}

// Seed initial data
const seedAdmin = db.prepare('INSERT OR IGNORE INTO users (username, password, name, role) VALUES (?, ?, ?, ?)');
seedAdmin.run('admin', 'admin123', 'Administrator', 'admin');


const seedCategory = db.prepare('INSERT OR IGNORE INTO categories (name) VALUES (?)');
['Skripsi', 'Tugas Akhir', 'Laporan PKL', 'Jurnal Mahasiswa', 'Game', 'Video', 'Aplikasi'].forEach((cat) => seedCategory.run(cat));

// API Routes

// Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?').get(username, password) as any;
  if (user) {
    res.json({ success: true, user: { id: user.id, username: user.username, name: user.name, role: user.role, email: user.email } });
  } else {
    res.status(401).json({ success: false, message: 'Username atau password salah' });
  }
});

// Register
app.post('/api/register', (req, res) => {
  const { username, password, name, email } = req.body;
  try {
    const stmt = db.prepare('INSERT INTO users (username, password, name, role, email) VALUES (?, ?, ?, ?, ?)');
    stmt.run(username, password, name, 'student', email);
    res.json({ success: true });
  } catch (err: any) {
    if (err.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ success: false, message: 'NIM sudah terdaftar' });
    } else {
      res.status(500).json({ success: false, message: err.message });
    }
  }
});

// Request Access Bab 4/5
app.post('/api/request-access', (req, res) => {
  const { document_id, requester_email, requester_name, reason } = req.body;
  try {
    const stmt = db.prepare('INSERT INTO access_requests (document_id, requester_email, requester_name, reason) VALUES (?, ?, ?, ?)');
    stmt.run(document_id, requester_email, requester_name, reason);
    res.json({ success: true, message: 'Permintaan akses berhasil dikirim ke admin.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get Access Requests (Admin Only)
app.get('/api/access-requests', (req, res) => {
  const results = db.prepare(`
    SELECT a.*, r.title as document_title, r.document_code 
    FROM access_requests a
    LEFT JOIN repository r ON a.document_id = r.id
    ORDER BY a.created_at DESC
  `).all();
  res.json(results);
});

// Update Access Request Status (Admin Only)
app.put('/api/access-requests/:id', (req, res) => {
  const { status } = req.body;
  try {
    db.prepare('UPDATE access_requests SET status = ? WHERE id = ?').run(status, req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Check Access Status
app.get('/api/access-requests/check', (req, res) => {
  const { document_id, email } = req.query;
  const request = db.prepare(`
    SELECT status FROM access_requests 
    WHERE document_id = ? AND requester_email = ? 
    ORDER BY created_at DESC LIMIT 1
  `).get(document_id, email) as any;
  
  if (request) {
    res.json({ status: request.status });
  } else {
    res.json({ status: null });
  }
});

// Get Categories
app.get('/api/categories', (req, res) => {
  const categories = db.prepare('SELECT * FROM categories').all();
  res.json(categories);
});

// Category CRUD
app.post('/api/categories', (req, res) => {
  const { name, logo_url } = req.body;
  try {
    db.prepare('INSERT INTO categories (name, logo_url) VALUES (?, ?)').run(name, logo_url || null);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});
app.put('/api/categories/:id', (req, res) => {
  const { name, logo_url } = req.body;
  try {
    db.prepare('UPDATE categories SET name = ?, logo_url = ? WHERE id = ?').run(name, logo_url || null, req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});
app.delete('/api/categories/:id', (req, res) => {
  try {
    const id = req.params.id;
    // Set category_id to null for any documents using this category
    db.prepare('UPDATE repository SET category_id = NULL WHERE category_id = ?').run(id);
    // Delete the category
    db.prepare('DELETE FROM categories WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Gagal menghapus kategori: ' + err.message });
  }
});

// Users API (Admin)
app.get('/api/users', (req, res) => {
  const users = db.prepare('SELECT id, username, name, email, role, created_at FROM users').all();
  res.json(users);
});
app.post('/api/users', (req, res) => {
  const { username, password, name, email, role } = req.body;
  try {
    db.prepare('INSERT INTO users (username, password, name, email, role) VALUES (?, ?, ?, ?, ?)').run(username, password, name, email, role);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Username sudah ada' });
  }
});
app.put('/api/users/:id', (req, res) => {
  const { username, password, name, email, role } = req.body;
  try {
    if (password) {
      db.prepare('UPDATE users SET username = ?, password = ?, name = ?, email = ?, role = ? WHERE id = ?').run(username, password, name, email, role, req.params.id);
    } else {
      db.prepare('UPDATE users SET username = ?, name = ?, email = ?, role = ? WHERE id = ?').run(username, name, email, role, req.params.id);
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});
app.delete('/api/users/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Image Upload Endpoint for Settings Logo
const imageUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
    },
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Hanya format gambar yang diperbolehkan!'));
    }
  }
});

app.post('/api/upload-image', imageUpload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Tidak ada gambar yang diupload' });
    }
    const imageUrl = `/uploads/file_pdf/${req.file.filename}`;
    res.json({ success: true, url: imageUrl });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Site Settings API
app.get('/api/settings', (req, res) => {
  const settings = db.prepare('SELECT * FROM site_settings').all();
  const settingsObj = (settings as any[]).reduce((acc, curr) => ({ ...acc, [curr.setting_key]: curr.setting_value }), {});
  res.json(settingsObj);
});
app.post('/api/settings', (req, res) => {
  const settings = req.body; // Expecting { key: value, ... }
  try {
    const stmt = db.prepare('INSERT OR REPLACE INTO site_settings (setting_key, setting_value) VALUES (?, ?)');
    const execMany = db.transaction((settingsMap: any) => {
      for (const [key, value] of Object.entries(settingsMap)) {
        stmt.run(key, value);
      }
    });
    execMany(settings);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// CMS: Pages API
app.get('/api/pages', (req, res) => {
  const pages = db.prepare('SELECT * FROM pages ORDER BY created_at DESC').all();
  res.json(pages);
});

app.get('/api/pages/slug/:slug', (req, res) => {
  const page = db.prepare('SELECT * FROM pages WHERE slug = ?').get(req.params.slug);
  if (page) res.json(page);
  else res.status(404).json({ message: 'Halaman tidak ditemukan' });
});

app.post('/api/pages', (req, res) => {
  const { title, slug, content, is_hidden } = req.body;
  try {
    const stmt = db.prepare('INSERT INTO pages (title, slug, content, is_hidden) VALUES (?, ?, ?, ?)');
    stmt.run(title, slug, content, is_hidden ? 1 : 0);
    res.json({ success: true });
  } catch (err: any) {
    if (err.message.includes('UNIQUE')) res.status(400).json({ success: false, message: 'Slug sudah dipakai' });
    else res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/pages/:id', (req, res) => {
  const { title, slug, content, is_hidden } = req.body;
  try {
    const stmt = db.prepare('UPDATE pages SET title = ?, slug = ?, content = ?, is_hidden = ? WHERE id = ?');
    stmt.run(title, slug, content, is_hidden ? 1 : 0, req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/pages/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM pages WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// CMS: Menus API
app.get('/api/menus', (req, res) => {
  const menus = db.prepare('SELECT * FROM menus ORDER BY order_index ASC').all();
  res.json(menus);
});

app.post('/api/menus', (req, res) => {
  const { label, url, order_index, is_hidden } = req.body;
  try {
    const stmt = db.prepare('INSERT INTO menus (label, url, order_index, is_hidden) VALUES (?, ?, ?, ?)');
    stmt.run(label, url, order_index || 0, is_hidden ? 1 : 0);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/menus/:id', (req, res) => {
  const { label, url, order_index, is_hidden } = req.body;
  try {
    const stmt = db.prepare('UPDATE menus SET label = ?, url = ?, order_index = ?, is_hidden = ? WHERE id = ?');
    stmt.run(label, url, order_index || 0, is_hidden ? 1 : 0, req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/menus/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM menus WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get Repository List (with search and filter, public only approved)
app.get('/api/repository', (req, res) => {
  const { q, year, category, sort, status } = req.query;
  let query = `
    SELECT r.*, COALESCE(c.name, 'Tanpa Kategori') as category_name 
    FROM repository r 
    LEFT JOIN categories c ON r.category_id = c.id 
    WHERE 1=1
  `;
  const params: any[] = [];

  if (status) {
    if (status !== 'all') {
      query += ` AND r.status = ?`;
      params.push(status);
    }
  } else {
    query += ` AND r.status = 'approved'`;
  }

  if (q) {
    query += ` AND (r.title LIKE ? OR r.author LIKE ? OR r.nim LIKE ? OR r.keywords LIKE ?)`;
    const searchParam = `%${q}%`;
    params.push(searchParam, searchParam, searchParam, searchParam);
  }
  if (year) {
    query += ` AND r.year = ?`;
    params.push(year);
  }
  if (category) {
    query += ` AND r.category_id = ?`;
    params.push(category);
  }

  if (sort === 'author_asc') {
    query += ` ORDER BY r.author ASC`;
  } else if (sort === 'author_desc') {
    query += ` ORDER BY r.author DESC`;
  } else if (sort === 'oldest') {
    query += ` ORDER BY r.created_at ASC`;
  } else {
    query += ` ORDER BY r.created_at DESC`;
  }

  const results = db.prepare(query).all(...params);
  res.json(results);
});

// Get Student Submissions
app.get('/api/student/repository/:uploader_id', (req, res) => {
  const results = db.prepare(`
    SELECT r.*, COALESCE(c.name, 'Tanpa Kategori') as category_name 
    FROM repository r 
    LEFT JOIN categories c ON r.category_id = c.id 
    WHERE r.uploader_id = ?
    ORDER BY r.created_at DESC
  `).all(req.params.uploader_id);
  res.json(results);
});

// Get Single Document
app.get('/api/repository/:id', (req, res) => {
  const doc = db.prepare(`
    SELECT r.*, COALESCE(c.name, 'Tanpa Kategori') as category_name 
    FROM repository r 
    LEFT JOIN categories c ON r.category_id = c.id 
    WHERE r.id = ?
  `).get(req.params.id);
  
  if (doc) {
    res.json(doc);
  } else {
    res.status(404).json({ message: 'Document not found' });
  }
});

const cpUpload = upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'file_bab1', maxCount: 1 },
  { name: 'file_bab2', maxCount: 1 },
  { name: 'file_bab3', maxCount: 1 },
  { name: 'file_bab4', maxCount: 1 },
  { name: 'file_bab5', maxCount: 1 },
]);

// Add Document
app.post('/api/repository', upload.any(), (req, res) => {
  try {
    const { title, author, nim, year, abstract, keywords, category_id, external_link, uploader_id, status, file_path_label } = req.body;
    const categoryIdNum = category_id ? parseInt(category_id, 10) : null;
    const uploaderIdNum = uploader_id && uploader_id !== 'undefined' && uploader_id !== 'null' ? parseInt(uploader_id, 10) : null;
    
    const filesArray = req.files as Express.Multer.File[] || [];
    const getFile = (name: string) => filesArray.find(f => f.fieldname === name)?.filename || null;

    const file = getFile('file');
    const file_bab1 = getFile('file_bab1');
    const file_bab2 = getFile('file_bab2');
    const file_bab3 = getFile('file_bab3');
    const file_bab4 = getFile('file_bab4');
    const file_bab5 = getFile('file_bab5');

    let custom_files = '[]';
    try {
      const customFilesMeta = JSON.parse(req.body.custom_files_meta || '[]');
      const processedCustomFiles = customFilesMeta.map((meta: any) => {
        if (meta.isNew) {
          const f = getFile(meta.fieldname);
          return f ? { label: meta.label, filename: f } : null;
        }
        return { label: meta.label, filename: meta.filename };
      }).filter(Boolean);
      custom_files = JSON.stringify(processedCustomFiles);
    } catch (e) {
      console.error('Error parsing custom_files_meta', e);
    }

    if (!file && !file_bab1 && !external_link && custom_files === '[]') {
      return res.status(400).json({ message: 'File atau Link Eksternal wajib diisi' });
    }

    // Generate Document Code: REP-TAHUN-NIM-NOMOR
    const primaryNim = nim ? String(nim).split(',')[0].trim() : '0000';
    const latestDoc = db.prepare(`
      SELECT document_code FROM repository 
      WHERE year = ? AND nim LIKE ? 
      ORDER BY id DESC LIMIT 1
    `).get(year, `${primaryNim}%`) as any;

    let nextNum = 1;
    if (latestDoc) {
      const parts = latestDoc.document_code.split('-');
      const lastNum = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastNum)) {
        nextNum = lastNum + 1;
      }
    }
    const document_code = `REP-${year}-${primaryNim}-${String(nextNum).padStart(3, '0')}`;

    const stmt = db.prepare(`
      INSERT INTO repository (document_code, title, author, nim, year, abstract, keywords, category_id, file_path, file_bab1, file_bab2, file_bab3, file_bab4, file_bab5, external_link, status, uploader_id, custom_files, file_path_label)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const info = stmt.run(document_code, title, author, nim, year, abstract, keywords, categoryIdNum, file, file_bab1, file_bab2, file_bab3, file_bab4, file_bab5, external_link || null, status || 'approved', uploaderIdNum, custom_files, file_path_label || null);
    
    res.json({ success: true, id: info.lastInsertRowid, document_code });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Update Document
app.put('/api/repository/:id', upload.any(), (req, res) => {
  try {
    const { title, author, nim, year, abstract, keywords, category_id, external_link, status, admin_comment, file_path_label } = req.body;
    const categoryIdNum = category_id ? parseInt(category_id, 10) : null;
    const filesArray = req.files as Express.Multer.File[] || [];
    const getFile = (name: string) => filesArray.find(f => f.fieldname === name)?.filename || null;
    const id = req.params.id;

    const existingDoc = db.prepare('SELECT * FROM repository WHERE id = ?').get(id) as any;
    if (!existingDoc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const updates = ['title = ?', 'author = ?', 'nim = ?', 'year = ?', 'abstract = ?', 'keywords = ?', 'category_id = ?', 'external_link = ?'];
    const values = [title, author, nim, year, abstract, keywords, categoryIdNum, external_link || null];

    if (status) {
      updates.push('status = ?');
      values.push(status);
    }
    if (admin_comment !== undefined) {
      updates.push('admin_comment = ?');
      values.push(admin_comment);
    }
    if (file_path_label !== undefined) {
      updates.push('file_path_label = ?');
      values.push(file_path_label);
    }

    const processFile = (fieldName: string) => {
      const newFile = getFile(fieldName);
      if (newFile) {
        if (existingDoc[fieldName]) {
          const oldPath = path.join(uploadDir, existingDoc[fieldName]);
          if (fs.existsSync(oldPath)) {
             try { fs.unlinkSync(oldPath); } catch (e) { console.error('Error removing old file', e); }
          }
        }
        updates.push(`${fieldName} = ?`);
        values.push(newFile);
      }
    };

    processFile('file_path'); // Actually the column is file_path, but req body is 'file'
    const newFileFull = getFile('file');
    if (newFileFull) {
        if (existingDoc['file_path']) {
          const oldPath = path.join(uploadDir, existingDoc['file_path']);
          if (fs.existsSync(oldPath)) {
             try { fs.unlinkSync(oldPath); } catch (e) { console.error('Error removing old file', e); }
          }
        }
        updates.push(`file_path = ?`);
        values.push(newFileFull);
    }
    
    processFile('file_bab1');
    processFile('file_bab2');
    processFile('file_bab3');
    processFile('file_bab4');
    processFile('file_bab5');

    try {
      if (req.body.custom_files_meta) {
        const customFilesMeta = JSON.parse(req.body.custom_files_meta);
        const processedCustomFiles = customFilesMeta.map((meta: any) => {
          if (meta.isDeleted && !meta.isNew && meta.filename) {
            const oldPath = path.join(uploadDir, meta.filename);
            if (fs.existsSync(oldPath)) {
               try { fs.unlinkSync(oldPath); } catch (e) { console.error('Error removing old file', e); }
            }
            return null;
          }
          if (meta.isNew && !meta.isDeleted) {
            const f = getFile(meta.fieldname);
            return f ? { label: meta.label, filename: f } : null;
          }
          if (!meta.isDeleted && !meta.isNew) {
            const f = getFile(meta.fieldname);
            if (f) {
              if (meta.filename) {
                const oldPath = path.join(uploadDir, meta.filename);
                if (fs.existsSync(oldPath)) {
                   try { fs.unlinkSync(oldPath); } catch (e) { console.error('Error removing old file', e); }
                }
              }
              return { label: meta.label, filename: f };
            }
            return { label: meta.label, filename: meta.filename };
          }
          return null;
        }).filter(Boolean);
        updates.push(`custom_files = ?`);
        values.push(JSON.stringify(processedCustomFiles));
      }
    } catch (e) {
      console.error('Error parsing custom_files_meta', e);
    }

    values.push(id); // push id for WHERE clause

    const stmt = db.prepare(`
      UPDATE repository 
      SET ${updates.join(', ')}
      WHERE id = ?
    `);
    
    stmt.run(...values);
    
    res.json({ success: true });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Delete Document
app.delete('/api/repository/:id', (req, res) => {
  try {
    const id = req.params.id;
    const existingDoc = db.prepare('SELECT file_path, file_bab1, file_bab2, file_bab3, file_bab4, file_bab5, custom_files FROM repository WHERE id = ?').get(id) as any;
    
    if (existingDoc) {
      // Remove all associated files
      const filesToRemove = [
        existingDoc.file_path, existingDoc.file_bab1, 
        existingDoc.file_bab2, existingDoc.file_bab3, 
        existingDoc.file_bab4, existingDoc.file_bab5
      ];
      try {
        if (existingDoc.custom_files) {
          const customFiles = JSON.parse(existingDoc.custom_files);
          customFiles.forEach((f: any) => {
             if (f.filename) filesToRemove.push(f.filename);
          });
        }
      } catch (e) {}
      
      filesToRemove.forEach(file => {
        if (file) {
          const oldPath = path.join(uploadDir, file);
          if (fs.existsSync(oldPath)) {
            try { fs.unlinkSync(oldPath); } catch (e) { console.error('Error removing old file', e); }
          }
        }
      });
      
      db.prepare('DELETE FROM access_requests WHERE document_id = ?').run(id);
      db.prepare('DELETE FROM repository WHERE id = ?').run(id);
      res.json({ success: true });
    } else {
      res.status(404).json({ message: 'Document not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Dashboard Stats
app.get('/api/stats', (req, res) => {
  const totalDocs = (db.prepare("SELECT COUNT(*) as count FROM repository WHERE status = 'approved'").get() as any).count;
  const docsByCategory = db.prepare(`
    SELECT c.name, c.id, c.logo_url, COUNT(r.id) as count 
    FROM categories c 
    LEFT JOIN repository r ON c.id = r.category_id AND r.status = 'approved'
    GROUP BY c.id
  `).all();
  const recentDocs = db.prepare(`
    SELECT r.*, COALESCE(c.name, 'Tanpa Kategori') as category_name 
    FROM repository r 
    LEFT JOIN categories c ON r.category_id = c.id 
    WHERE r.status = 'approved'
    ORDER BY r.created_at DESC LIMIT 5
  `).all();
  
  const pendingCount = (db.prepare("SELECT COUNT(*) as count FROM repository WHERE status = 'pending'").get() as any).count;

  res.json({ totalDocs, docsByCategory, recentDocs, pendingCount });
});

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
