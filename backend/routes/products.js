const router = require('express').Router();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { wrap, httpError } = require('../utils/http');
const { saveImage, deleteImage } = require('../utils/images');

const POP = 'name slug emoji color';
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // user text must not become a regex

// admin sends the ORIGINAL price + a discount percent. We work out the selling price.
async function parse(b) {
  const name = String(b.name || '').trim();
  const base = Number(b.price);
  const discount = Number(b.discount === undefined || b.discount === '' ? 0 : b.discount);
  const stock = Number(b.stock === undefined || b.stock === '' ? 0 : b.stock);
  if (!name) throw httpError(400, 'Product name is required');
  if (!Number.isFinite(base) || base < 0) throw httpError(400, 'Price must be a number, 0 or more');
  if (!Number.isFinite(discount) || discount < 0 || discount > 90) throw httpError(400, 'Discount must be between 0 and 90 percent');
  if (!Number.isInteger(stock) || stock < 0) throw httpError(400, 'Stock must be a whole number, 0 or more');
  if (!mongoose.isValidObjectId(b.category) || !(await Category.exists({ _id: b.category })))
    throw httpError(400, 'Please pick a category');
  return {
    name, description: String(b.description || '').trim(), stock, category: b.category,
    discount,
    price: Math.round(base * (1 - discount / 100)),
    oldPrice: discount > 0 ? base : 0,
  };
}

async function upl(file) {
  try { return await saveImage(file); }
  catch (e) { throw httpError(502, 'Image upload failed: ' + (e.message || 'check your Cloudinary keys in backend/.env')); }
}

// public list: ?search ?category=<slug|id> ?sort=new|price_asc|price_desc ?ids=a,b ?limit ?sale=1 ?minPrice ?maxPrice
router.get('/', wrap(async (req, res) => {
  const q = {};
  if (req.query.search) q.name = { $regex: esc(String(req.query.search)), $options: 'i' };
  if (req.query.ids) q._id = { $in: String(req.query.ids).split(',').filter(mongoose.isValidObjectId) };
  if (req.query.sale === '1') q.oldPrice = { $gt: 0 };
  const lo = Number(req.query.minPrice), hi = Number(req.query.maxPrice);
  if (req.query.minPrice && Number.isFinite(lo)) q.price = { ...q.price, $gte: lo };
  if (req.query.maxPrice && Number.isFinite(hi)) q.price = { ...q.price, $lte: hi };
  if (req.query.category) {
    const key = String(req.query.category);
    const c = await Category.findOne(mongoose.isValidObjectId(key) ? { _id: key } : { slug: key });
    if (!c) return res.json([]);
    q.category = c._id;
  }
  const sorts = { new: '-createdAt', price_asc: 'price', price_desc: '-price' };
  res.json(
    await Product.find(q)
      .sort(sorts[req.query.sort] || '-createdAt')
      .limit(Math.min(Number(req.query.limit) || 0, 100))
      .populate('category', POP)
  );
}));

router.get('/:id', wrap(async (req, res) => {
  const p = await Product.findById(req.params.id).populate('category', POP);
  if (!p) throw httpError(404, 'Product not found');
  res.json(p);
}));

router.post('/', protect, adminOnly, upload.single('image'), wrap(async (req, res) => {
  const data = await parse(req.body);
  const img = req.file ? await upl(req.file) : null;
  const p = await Product.create({ ...data, image: img?.url || '', imagePublicId: img?.publicId || '' });
  res.status(201).json(await p.populate('category', POP));
}));

router.put('/:id', protect, adminOnly, upload.single('image'), wrap(async (req, res) => {
  const data = await parse(req.body);
  const p = await Product.findById(req.params.id);
  if (!p) throw httpError(404, 'Product not found');
  Object.assign(p, data);
  if (req.file) {
    const img = await upl(req.file);
    await deleteImage(p);           // remove the old photo only after the new one is safe
    p.image = img.url;
    p.imagePublicId = img.publicId;
  }
  await p.save();
  res.json(await p.populate('category', POP));
}));

router.delete('/:id', protect, adminOnly, wrap(async (req, res) => {
  const p = await Product.findByIdAndDelete(req.params.id);
  if (!p) throw httpError(404, 'Product not found');
  await deleteImage(p);
  res.json({ message: 'Deleted' });
}));

module.exports = router;
