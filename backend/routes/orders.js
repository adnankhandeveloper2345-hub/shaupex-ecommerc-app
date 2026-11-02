const router = require('express').Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const { protect, adminOnly } = require('../middleware/auth');
const { wrap, httpError } = require('../utils/http');
const { getSettings } = require('../utils/settings');
const { checkCoupon } = require('../utils/coupon');

// allowed status moves. Delivered and Cancelled are final (this also stops double restocking)
const FLOW = { Pending: ['Shipped', 'Cancelled'], Shipped: ['Delivered', 'Cancelled'], Delivered: [], Cancelled: [] };

const restock = (order) =>
  Promise.all(order.items.map((it) => Product.findByIdAndUpdate(it.product, { $inc: { stock: it.qty } })));

// place order (Cash on Delivery). Prices, coupon and delivery charges are all worked out here, never trusted from the browser.
router.post('/', protect, wrap(async (req, res) => {
  const { items } = req.body;
  const address = String(req.body.address || '').trim();
  const phone = String(req.body.phone || '').trim();
  if (!Array.isArray(items) || !items.length) throw httpError(400, 'Your cart is empty');
  if (address.length < 8) throw httpError(400, 'Please enter your full delivery address');
  if (!/^[0-9+\-\s]{7,15}$/.test(phone)) throw httpError(400, 'Please enter a valid phone number');

  const merged = new Map(); // same product twice -> one line
  for (const it of items) {
    const qty = parseInt(it.qty, 10);
    if (!mongoose.isValidObjectId(it.product) || !qty || qty < 1) throw httpError(400, 'Invalid item in cart');
    merged.set(String(it.product), (merged.get(String(it.product)) || 0) + qty);
  }

  const settings = await getSettings();
  const taken = [], lines = [];
  let subtotal = 0, order, couponDoc = null, discount = 0;
  try {
    for (const [id, qty] of merged) {
      // atomic: only decrements if enough stock is left, so two buyers can't oversell
      const p = await Product.findOneAndUpdate({ _id: id, stock: { $gte: qty } }, { $inc: { stock: -qty } }, { new: true });
      if (!p) {
        const cur = await Product.findById(id);
        throw httpError(400, !cur ? 'A product in your cart is no longer available'
          : cur.stock ? `Only ${cur.stock} left of "${cur.name}"` : `"${cur.name}" is sold out`);
      }
      taken.push({ id, qty });
      lines.push({ product: p._id, name: p.name, price: p.price, qty, image: p.image });
      subtotal += p.price * qty;
    }
    if (req.body.coupon) ({ coupon: couponDoc, discount } = await checkCoupon(req.body.coupon, subtotal));
    const shipping = subtotal >= settings.freeShippingAbove ? 0 : settings.shippingFee;
    order = await Order.create({
      user: req.user._id, items: lines, address, phone, subtotal, shipping,
      coupon: couponDoc?.code || '', discount, total: subtotal - discount + shipping,
    });
  } catch (e) {
    await Promise.all(taken.map((t) => Product.findByIdAndUpdate(t.id, { $inc: { stock: t.qty } }))); // undo
    throw e;
  }
  if (couponDoc) await Coupon.updateOne({ _id: couponDoc._id }, { $inc: { usedCount: 1 } });
  res.status(201).json(order);
}));

router.get('/my', protect, wrap(async (req, res) => {
  res.json(await Order.find({ user: req.user._id }).sort('-createdAt'));
}));

// customer can cancel only while Pending
router.put('/:id/cancel', protect, wrap(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) throw httpError(404, 'Order not found');
  if (order.status !== 'Pending') throw httpError(400, 'Only pending orders can be cancelled');
  await restock(order);
  order.status = 'Cancelled';
  await order.save();
  res.json(order);
}));

// admin
router.get('/', protect, adminOnly, wrap(async (req, res) => {
  const q = FLOW[req.query.status] ? { status: req.query.status } : {};
  res.json(await Order.find(q).populate('user', 'name email').sort('-createdAt'));
}));

router.put('/:id/status', protect, adminOnly, wrap(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw httpError(404, 'Order not found');
  const { status } = req.body;
  if (!FLOW[order.status].includes(status))
    throw httpError(400, `An order that is ${order.status} cannot be changed to ${status}`);
  if (status === 'Cancelled') await restock(order);
  order.status = status;
  await order.save();
  res.json(order);
}));

module.exports = router;
