const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const path    = require('path');
const db      = require('../database');
const { requireAdmin } = require('../middleware/adminAuth');

// ── File uploads ────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename:    (req, file, cb) => cb(null, 'admin-' + Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 200 * 1024 * 1024 } });

// Apply admin auth to all routes
router.use(requireAdmin);

// ── Auth check ──────────────────────────────────────────────────────────
router.post('/login', (req, res) => {
  const { password } = req.body;
  const expected = process.env.ADMIN_PASSWORD || 'etoh_admin_2024';
  if (password === expected) return res.json({ ok: true });
  res.status(401).json({ error: 'Wrong password.' });
});

// ── Dashboard stats ─────────────────────────────────────────────────────
router.get('/stats', (req, res) => {
  const counts = {};
  const tasks = [
    ['users',    'SELECT COUNT(*) as n FROM users'],
    ['stands',   'SELECT COUNT(*) as n FROM stands'],
    ['products', 'SELECT COUNT(*) as n FROM products'],
    ['reels',    'SELECT COUNT(*) as n FROM posts WHERE media_type = "video"'],
    ['orders',   'SELECT COUNT(*) as n FROM orders'],
  ];
  let done = 0;
  tasks.forEach(([key, sql]) => {
    db.get(sql, [], (err, row) => {
      counts[key] = row?.n || 0;
      if (++done === tasks.length) res.json(counts);
    });
  });
});

// ── Products ────────────────────────────────────────────────────────────
router.get('/products', (req, res) => {
  const { search = '', category = '' } = req.query;
  let sql = `
    SELECT p.*, s.vendor_name, s.city
    FROM products p LEFT JOIN stands s ON p.stand_id = s.id
    WHERE 1=1
  `;
  const params = [];
  if (search)   { sql += ' AND (p.product_name LIKE ? OR s.vendor_name LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  if (category) { sql += ' AND p.category = ?'; params.push(category); }
  sql += ' ORDER BY p.id DESC';
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.put('/products/:id', (req, res) => {
  upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }])(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    const { product_name, price_cfa, category } = req.body;
    const image_path = req.files?.image ? '/uploads/' + req.files.image[0].filename : undefined;
    const video_path = req.files?.video ? '/uploads/' + req.files.video[0].filename : undefined;

    db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, existing) => {
      if (err || !existing) return res.status(404).json({ error: 'Product not found.' });
      const updates = [];
      const vals    = [];
      if (product_name) { updates.push('product_name = ?'); vals.push(product_name.trim()); }
      if (price_cfa)    { updates.push('price_cfa = ?');    vals.push(parseFloat(price_cfa)); }
      if (category)     { updates.push('category = ?');     vals.push(category); }
      if (image_path)   { updates.push('image_path = ?');   vals.push(image_path); }
      if (video_path)   { updates.push('video_path = ?');   vals.push(video_path); }
      if (!updates.length) return res.json({ message: 'Nothing to update.' });
      vals.push(req.params.id);
      db.run(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`, vals, function (err2) {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json({ message: 'Product updated.' });
      });
    });
  });
});

router.delete('/products/:id', (req, res) => {
  db.run('DELETE FROM products WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Product deleted.' });
  });
});

// ── Reels / Market Buzz ─────────────────────────────────────────────────
router.get('/reels', (req, res) => {
  const sql = `
    SELECT p.*, u.name as author_name, s.vendor_name
    FROM posts p
    LEFT JOIN users  u ON p.user_id  = u.id
    LEFT JOIN stands s ON p.stand_id = s.id
    WHERE p.media_type = 'video'
    ORDER BY p.created_at DESC
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/reels', (req, res) => {
  upload.single('video')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    const { title, description, stand_id, user_id } = req.body;
    if (!title || !req.file) return res.status(400).json({ error: 'Title and video file are required.' });
    const media_path = '/uploads/' + req.file.filename;
    // Default to first user if not specified
    const uid = user_id || 1;
    db.run(
      'INSERT INTO posts (user_id, stand_id, title, description, media_path, media_type) VALUES (?,?,?,?,?,?)',
      [uid, stand_id || null, title.trim(), description || '', media_path, 'video'],
      function (err2) {
        if (err2) return res.status(500).json({ error: err2.message });
        res.status(201).json({ id: this.lastID, title, media_path });
      }
    );
  });
});

router.put('/reels/:id', (req, res) => {
  const { title, description } = req.body;
  db.run(
    'UPDATE posts SET title = COALESCE(?, title), description = COALESCE(?, description) WHERE id = ?',
    [title || null, description || null, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Reel updated.' });
    }
  );
});

router.delete('/reels/:id', (req, res) => {
  db.run('DELETE FROM posts WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Reel deleted.' });
  });
});

// ── Stands ──────────────────────────────────────────────────────────────
router.get('/stands', (req, res) => {
  const sql = `
    SELECT s.*, u.name as owner_name, u.email as owner_email,
           COUNT(p.id) as product_count
    FROM stands s
    LEFT JOIN users    u ON s.user_id  = u.id
    LEFT JOIN products p ON p.stand_id = s.id
    GROUP BY s.id
    ORDER BY s.creation_date DESC
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.put('/stands/:id/verify', (req, res) => {
  const verified = req.body.verified ? 1 : 0;
  db.run('UPDATE stands SET is_verified = ? WHERE id = ?', [verified, req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: verified ? 'Stand verified.' : 'Verification removed.' });
  });
});

router.delete('/stands/:id', (req, res) => {
  db.run('DELETE FROM stands WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Stand deleted.' });
  });
});

// ── Users ───────────────────────────────────────────────────────────────
router.get('/users', (req, res) => {
  const sql = `
    SELECT u.id, u.name, u.email, u.whatsapp, u.profile_picture, u.bio, u.created_at,
           COUNT(s.id) as stand_count
    FROM users u
    LEFT JOIN stands s ON s.user_id = u.id
    GROUP BY u.id
    ORDER BY u.created_at DESC
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.delete('/users/:id', (req, res) => {
  db.run('DELETE FROM users WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'User deleted.' });
  });
});

// ── Orders ──────────────────────────────────────────────────────────────
router.get('/orders', (req, res) => {
  const sql = `
    SELECT o.*, p.product_name, p.price_cfa, s.vendor_name, s.city
    FROM orders o
    JOIN products p ON o.product_id = p.id
    JOIN stands   s ON p.stand_id   = s.id
    ORDER BY o.order_date DESC
    LIMIT 100
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ── Stands list for dropdowns ───────────────────────────────────────────
router.get('/stands-list', (req, res) => {
  db.all('SELECT id, vendor_name, city FROM stands ORDER BY vendor_name', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

module.exports = router;
