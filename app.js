require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/admin',    require('./routes/admin'));
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/stands',   require('./routes/stands'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders',   require('./routes/orders'));
app.use('/api/posts',    require('./routes/posts'));
app.use('/api/ai',       require('./routes/gemini'));
app.use('/api/prices',   require('./routes/prices'));

const clientDist = path.join(__dirname, 'client', 'dist');
app.use(express.static(clientDist));
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Not found' });
  res.sendFile(path.join(clientDist, 'index.html'));
});

module.exports = app;
