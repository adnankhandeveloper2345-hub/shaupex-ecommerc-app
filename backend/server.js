require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Category = require('./models/Category');

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is missing in backend/.env');
  process.exit(1);
}
fs.mkdirSync(path.join(__dirname, 'uploads'), { recursive: true });

const app = express();
app.use(cors({
  origin: "https://shoupex.netlify.app",
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api', (req, res) => res.status(404).json({ message: 'Route not found' }));

// one place that turns every error into a clean JSON message
app.use((err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message || 'Server error';
  if (err.name === 'MulterError') {
    status = 400;
    message = err.code === 'LIMIT_FILE_SIZE' ? 'Image is too large (max 3MB)' : err.message;
  } else if (err.name === 'CastError') {
    status = 400; message = 'Invalid id';
  } else if (err.name === 'ValidationError') {
    status = 400; message = Object.values(err.errors).map((e) => e.message).join(', ');
  } else if (err.code === 11000) {
    status = 400; message = 'That already exists';
  }
  if (status === 500) console.error(err);
  res.status(status).json({ message });
});

async function seed() {
  if (!(await User.findOne({ role: 'admin' }))) {
    await User.create({
      name: 'Admin',
      email: process.env.ADMIN_EMAIL,
      password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 10),
      role: 'admin',
    });
    console.log(`Admin created -> ${process.env.ADMIN_EMAIL} / ${process.env.ADMIN_PASSWORD}`);
  }
  if ((await Category.countDocuments()) === 0) {
    await Category.insertMany([
      { name: 'Beauty Products', slug: 'beauty-products', emoji: '💄', color: '#e0457b' },
      { name: 'Fashion', slug: 'fashion', emoji: '👗', color: '#8b5cf6' },
      { name: 'Electronics', slug: 'electronics', emoji: '🎧', color: '#3b82f6' },
      { name: 'Home & Living', slug: 'home-living', emoji: '🛋️', color: '#0ea5a0' },
      { name: 'Groceries', slug: 'groceries', emoji: '🍎', color: '#16a34a' },
      { name: 'Toys & Games', slug: 'toys-games', emoji: '🧸', color: '#f59e0b' },
    ]);
    console.log('Default categories created');
  }
}

const mode = (process.env.DB_MODE || 'local').toLowerCase();
const uri = mode === 'atlas' ? process.env.MONGO_URI_ATLAS : process.env.MONGO_URI_LOCAL;
if (!uri) {
  console.error(`DB_MODE=${mode} but its connection string is empty in backend/.env`);
  process.exit(1);
}
console.log(`Connecting to MongoDB (${mode})...`);

mongoose
  .connect(uri)
  .then(async () => {
    console.log('MongoDB connected');
    console.log(require('./utils/images').cloudReady() ? 'Photos: Cloudinary' : 'Photos: local uploads folder (add Cloudinary keys in .env)');
    await seed();
    app.listen(process.env.PORT || 5000, () => console.log(`Server on http://localhost:${process.env.PORT || 5000}`));
  })
  .catch((e) => console.error('Mongo error:', e.message));
