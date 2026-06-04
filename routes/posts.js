const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../database');
const { requireAuth } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => {
    cb(null, 'post-' + Date.now() + '-' + Math.round(Math.random() * 1e6) + path.extname(file.originalname));
  }
});
const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } });

router.get('/', (req, res) => {
  const sql = `
    SELECT p.*, u.name as author_name, u.profile_picture as author_pic,
           s.vendor_name, s.id as stand_id, s.is_verified
    FROM posts p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN stands s ON p.stand_id = s.id
    ORDER BY p.created_at DESC
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.get('/:id', (req, res) => {
  const sql = `
    SELECT p.*, u.name as author_name, u.profile_picture as author_pic,
           s.vendor_name, s.id as stand_id
    FROM posts p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN stands s ON p.stand_id = s.id
    WHERE p.id = ?
  `;
  db.get(sql, [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Post not found.' });
    db.run('UPDATE posts SET likes = likes + 0 WHERE id = ?', [req.params.id]);
    res.json(row);
  });
});

router.post('/', requireAuth, (req, res) => {
  upload.single('media')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });

    const { title, description, stand_id } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required.' });

    const media_path = req.file ? '/uploads/' + req.file.filename : null;
    const videoExts = ['.mp4', '.mov', '.webm', '.avi', '.mkv', '.m4v', '.3gp'];
    const ext = req.file ? path.extname(req.file.originalname).toLowerCase() : '';
    const media_type = req.file
      ? (req.file.mimetype.startsWith('video') || videoExts.includes(ext)) ? 'video' : 'image'
      : null;

    db.run(
      'INSERT INTO posts (user_id, stand_id, title, description, media_path, media_type) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, stand_id || null, title.trim(), description || '', media_path, media_type],
      function (dbErr) {
        if (dbErr) return res.status(500).json({ error: dbErr.message });
        res.status(201).json({ id: this.lastID, title, media_path, media_type });
      }
    );
  });
});

router.post('/:id/like', (req, res) => {
  db.run('UPDATE posts SET likes = likes + 1 WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    db.get('SELECT likes FROM posts WHERE id = ?', [req.params.id], (err2, row) => {
      res.json({ likes: row?.likes || 0 });
    });
  });
});

router.delete('/:id', requireAuth, (req, res) => {
  db.get('SELECT * FROM posts WHERE id = ?', [req.params.id], (err, post) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!post) return res.status(404).json({ error: 'Post not found.' });
    if (post.user_id !== req.user.id) return res.status(403).json({ error: 'You do not own this post.' });
    db.run('DELETE FROM posts WHERE id = ?', [req.params.id], function (err2) {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ message: 'Post deleted.' });
    });
  });
});

module.exports = router;
