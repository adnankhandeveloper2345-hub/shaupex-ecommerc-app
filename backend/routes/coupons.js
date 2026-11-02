const router = require('express').Router();
const Coupon = require('../models/Coupon');
const { protect, adminOnly } = require('../middleware/auth');
const { wrap, httpError } = require('../utils/http');
const { checkCoupon } = require('../utils/coupon');

const clean = (b) => {
  const code = String(b.code || '').trim().toUpperCase();
  const percent = Number(b.percent);
  const minOrder = Number(b.minOrder || 0);
  if (!/^[A-Z0-9_-]{3,20}$/.test(code)) throw httpError(400, 'Code must be 3 to 20 letters or numbers');
  if (!Number.isFinite(percent) || percent < 1 || percent > 90) throw httpError(400, 'Discount must be between 1 and 90 percent');
  if (!Number.isFinite(minOrder) || minOrder < 0) throw httpError(400, 'Minimum order must be 0 or more');
  return { code, percent, minOrder, active: b.active !== false && b.active !== 'false' };
};

// customer checks a code at checkout
router.post('/validate', wrap(async (req, res) => {
  const subtotal = Number(req.body.subtotal) || 0;
  const { coupon, discount } = await checkCoupon(req.body.code, subtotal);
  res.json({ code: coupon.code, percent: coupon.percent, minOrder: coupon.minOrder, discount });
}));

router.get('/', protect, adminOnly, wrap(async (req, res) => res.json(await Coupon.find().sort('-createdAt'))));
router.post('/', protect, adminOnly, wrap(async (req, res) => res.status(201).json(await Coupon.create(clean(req.body)))));
router.put('/:id', protect, adminOnly, wrap(async (req, res) => {
  const c = await Coupon.findByIdAndUpdate(req.params.id, clean(req.body), { new: true, runValidators: true });
  if (!c) throw httpError(404, 'Coupon not found');
  res.json(c);
}));
router.delete('/:id', protect, adminOnly, wrap(async (req, res) => {
  if (!(await Coupon.findByIdAndDelete(req.params.id))) throw httpError(404, 'Coupon not found');
  res.json({ message: 'Deleted' });
}));

module.exports = router;
