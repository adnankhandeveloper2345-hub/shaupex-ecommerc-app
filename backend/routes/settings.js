const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const { wrap, httpError } = require('../utils/http');
const { getSettings } = require('../utils/settings');

const pub = (s) => ({ shippingFee: s.shippingFee, freeShippingAbove: s.freeShippingAbove });

router.get('/', wrap(async (req, res) => res.json(pub(await getSettings()))));

router.put('/', protect, adminOnly, wrap(async (req, res) => {
  const fee = Number(req.body.shippingFee);
  const above = Number(req.body.freeShippingAbove);
  if (!Number.isFinite(fee) || fee < 0) throw httpError(400, 'Delivery charges must be 0 or more');
  if (!Number.isFinite(above) || above < 0) throw httpError(400, 'Free delivery amount must be 0 or more');
  const s = await getSettings();
  s.shippingFee = Math.round(fee);
  s.freeShippingAbove = Math.round(above);
  await s.save();
  res.json(pub(s));
}));

module.exports = router;
