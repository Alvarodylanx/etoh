const express = require('express');
const router  = express.Router();
const db      = require('../database');

const ITEMS = [
  { name: 'Tomates',        unit: 'kg'       },
  { name: 'Plantains',      unit: 'régime'   },
  { name: 'Huile de palme', unit: 'litre'    },
  { name: 'Riz blanc',      unit: 'kg'       },
  { name: 'Ndolé',          unit: 'bottes'   },
  { name: 'Bœuf',           unit: 'kg'       },
  { name: 'Poulet entier',  unit: 'kg'       },
  { name: 'Poisson fumé',   unit: 'kg'       },
  { name: 'Manioc',         unit: 'kg'       },
  { name: 'Haricots',       unit: 'kg'       },
  { name: 'Piment rouge',   unit: 'bottes'   },
  { name: 'Gombo',          unit: 'kg'       },
];

router.get('/items', (req, res) => res.json(ITEMS));

router.get('/', (req, res) => {
  const { city = '' } = req.query;
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  let sql = `
    SELECT item_name, unit, city, market_name, reporter,
           price_cfa, reported_at,
           MIN(price_cfa) OVER (PARTITION BY item_name) as min_price,
           MAX(price_cfa) OVER (PARTITION BY item_name) as max_price,
           AVG(price_cfa) OVER (PARTITION BY item_name) as avg_price,
           COUNT(*)       OVER (PARTITION BY item_name) as report_count
    FROM price_reports
    WHERE reported_at >= ?
  `;
  const params = [since];
  if (city) { sql += ' AND city = ?'; params.push(city); }
  sql += ' ORDER BY reported_at DESC';

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    // Deduplicate: one summary row per item (latest report)
    const seen = new Set();
    const summary = rows.filter(r => { if (seen.has(r.item_name)) return false; seen.add(r.item_name); return true; });
    res.json({ summary, all: rows });
  });
});

router.post('/', (req, res) => {
  const { item_name, price_cfa, unit, market_name, city, reporter } = req.body;
  if (!item_name || !price_cfa || !city) return res.status(400).json({ error: 'item_name, price_cfa and city are required.' });
  if (Number(price_cfa) <= 0 || Number(price_cfa) > 10_000_000) return res.status(400).json({ error: 'price_cfa out of range.' });

  db.run(
    'INSERT INTO price_reports (item_name, price_cfa, unit, market_name, city, reporter) VALUES (?,?,?,?,?,?)',
    [item_name.trim(), Number(price_cfa), unit || 'kg', market_name || null, city.trim(), reporter || null],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, item_name, price_cfa: Number(price_cfa), city });
    }
  );
});

module.exports = router;
