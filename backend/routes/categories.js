const router = require('express').Router();
const Category = require('../models/Category');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');
const { wrap, httpError, slugify } = require('../utils/http');

const clean = (b) => {
  const name = String(b.name || '').trim();
  if (!name) throw httpError(400, 'Category name is required');
  const slug = slugify(name);
  if (!slug) throw httpError(400, 'Category name needs letters or numbers');
  const color = /^#[0-9a-fA-F]{6}$/.test(b.color) ? b.color : '#ff5fa8';
  return { name, slug, emoji: String(b.emoji || '🛍️').trim().slice(0, 8) || '🛍️', color };
};

// public: all categories with how many products each has
router.get('/', wrap(async (req, res) => {
  const [cats, counts] = await Promise.all([
    Category.find().sort('createdAt').lean(),
    Product.aggregate([{ $group: { _id: '$category', n: { $sum: 1 } } }]),
  ]);
  const map = new Map(counts.map((c) => [String(c._id), c.n]));
  res.json(cats.map((c) => ({ ...c, productCount: map.get(String(c._id)) || 0 })));
}));

router.post('/', protect, adminOnly, wrap(async (req, res) => {
  res.status(201).json(await Category.create(clean(req.body)));
}));

router.put('/:id', protect, adminOnly, wrap(async (req, res) => {
  const c = await Category.findByIdAndUpdate(req.params.id, clean(req.body), { new: true, runValidators: true });
  if (!c) throw httpError(404, 'Category not found');
  res.json(c);
}));

router.delete('/:id', protect, adminOnly, wrap(async (req, res) => {
  const n = await Product.countDocuments({ category: req.params.id });
  if (n > 0) throw httpError(400, `This category has ${n} product(s). Move or delete them first.`);
  const c = await Category.findByIdAndDelete(req.params.id);
  if (!c) throw httpError(404, 'Category not found');
  res.json({ message: 'Deleted' });
}));

module.exports = router;
