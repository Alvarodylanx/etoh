const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../database');
const { requireAuth } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|mp4|webm|ogg|wav|mp3/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext || mime) return cb(null, true);
    cb(new Error('Only image, video, and audio files are allowed'));
  }
});

const uploadFields = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 },
  { name: 'audio', maxCount: 1 }
]);

function verifyStandOwnership(standId, userId, cb) {
  db.get('SELECT user_id FROM stands WHERE id = ?', [standId], (err, stand) => {
    if (err) return cb(err);
    if (!stand) return cb(new Error('Stand not found.'));
    if (stand.user_id !== userId) return cb(new Error('FORBIDDEN'));
    cb(null);
  });
}

router.get('/', (req, res) => {
  const { city, category } = req.query;
  const conditions = [];
  const params = [];

  if (city)     { conditions.push('s.city = ?');     params.push(city); }
  if (category) { conditions.push('p.category = ?'); params.push(category); }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  const sql = `
    SELECT p.*, s.vendor_name, s.stand_description, s.city, s.is_verified
    FROM products p
    JOIN stands s ON p.stand_id = s.id
    ${where}
    ORDER BY p.id DESC
  `;
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.get('/:id', (req, res) => {
  const sql = `
    SELECT p.*, s.vendor_name, s.phone_number, s.stand_description, s.user_id as stand_owner_id, s.is_verified
    FROM products p
    JOIN stands s ON p.stand_id = s.id
    WHERE p.id = ?
  `;
  db.get(sql, [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Product not found' });
    res.json(row);
  });
});

router.post('/', requireAuth, (req, res) => {
  uploadFields(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });

    const { stand_id, product_name, price_cfa, category } = req.body;
    if (!stand_id || !product_name || !price_cfa) {
      return res.status(400).json({ error: 'stand_id, product_name, and price_cfa are required.' });
    }

    verifyStandOwnership(stand_id, req.user.id, (ownerErr) => {
      if (ownerErr) {
        if (ownerErr.message === 'FORBIDDEN') return res.status(403).json({ error: 'You do not own this stand.' });
        return res.status(400).json({ error: ownerErr.message });
      }

      const image_path = req.files?.image ? '/uploads/' + req.files.image[0].filename : null;
      const video_path = req.files?.video ? '/uploads/' + req.files.video[0].filename : null;
      const audio_voice_path = req.files?.audio ? '/uploads/' + req.files.audio[0].filename : null;
      const parsedPrice = parseFloat(price_cfa);
      const cat = category || 'general';

      db.run(
        'INSERT INTO products (stand_id, product_name, price_cfa, category, image_path, video_path, audio_voice_path) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [stand_id, product_name.trim(), parsedPrice, cat, image_path, video_path, audio_voice_path],
        function (err2) {
          if (err2) return res.status(500).json({ error: err2.message });
          res.status(201).json({ id: this.lastID, stand_id, product_name, price_cfa: parsedPrice, category: cat, image_path, video_path, audio_voice_path });
        }
      );
    });
  });
});

router.post('/:id/voice', requireAuth, (req, res) => {
  db.get('SELECT p.*, s.user_id FROM products p JOIN stands s ON p.stand_id = s.id WHERE p.id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Product not found.' });
    if (row.user_id !== req.user.id) return res.status(403).json({ error: 'You do not own this product.' });

    upload.single('audio')(req, res, (uploadErr) => {
      if (uploadErr) return res.status(400).json({ error: uploadErr.message });
      if (!req.file) return res.status(400).json({ error: 'No audio file uploaded.' });
      const audio_voice_path = '/uploads/' + req.file.filename;
      db.run('UPDATE products SET audio_voice_path = ? WHERE id = ?', [audio_voice_path, req.params.id], function (err2) {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json({ audio_voice_path });
      });
    });
  });
});

router.delete('/:id', requireAuth, (req, res) => {
  db.get('SELECT p.*, s.user_id FROM products p JOIN stands s ON p.stand_id = s.id WHERE p.id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Product not found.' });
    if (row.user_id !== req.user.id) return res.status(403).json({ error: 'You do not own this product.' });

    db.run('DELETE FROM products WHERE id = ?', [req.params.id], function (err2) {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ message: 'Product deleted.' });
    });
  });
});

module.exports = router;
