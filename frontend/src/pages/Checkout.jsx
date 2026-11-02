import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { errMsg, money } from '../api';
import { useStore } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';
import Icon from '../components/Icon';

export default function Checkout() {
  const { items, subtotal, shipping, clear, sync } = useStore();
  const toast = useToast();
  const nav = useNavigate();
  const placed = useRef(false);
  const [f, setF] = useState(() => { try { return JSON.parse(localStorage.getItem('delivery')) || { address: '', phone: '' }; } catch { return { address: '', phone: '' }; } });
  const [code, setCode] = useState('');
  const [coupon, setCoupon] = useState(null); // { code, percent, minOrder }
  const [cErr, setCErr] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { sync(); }, []); // eslint-disable-line
  useEffect(() => { if (!items.length && !placed.current) nav('/shop', { replace: true }); }, [items.length]); // eslint-disable-line
  useEffect(() => { // cart changed below the coupon's minimum
    if (coupon && subtotal < coupon.minOrder) { setCoupon(null); toast('Coupon removed: order is below its minimum', 'warn'); }
  }, [subtotal]); // eslint-disable-line

  const discount = coupon ? Math.round((subtotal * coupon.percent) / 100) : 0;
  const total = subtotal - discount + shipping;

  const applyCoupon = async () => {
    setCErr('');
    if (!code.trim()) return;
    try {
      const { data } = await api.post('/coupons/validate', { code, subtotal });
      setCoupon(data); setCode('');
      toast(`Coupon ${data.code} applied`);
    } catch (e) { setCErr(errMsg(e)); }
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr('');
    try {
      await api.post('/orders', { items: items.map((i) => ({ product: i._id, qty: i.qty })), address: f.address, phone: f.phone, coupon: coupon?.code });
      localStorage.setItem('delivery', JSON.stringify(f));
      placed.current = true;
      clear();
      nav('/orders', { state: { placed: true }, replace: true });
    } catch (e) { setErr(errMsg(e)); setBusy(false); sync(); }
  };

  return (
    <div className="container section">
      <h1 className="page-h1">Checkout</h1>
      <div className="checkout">
        <form className="panel" onSubmit={submit}>
          <h3>Delivery details</h3>
          {err && <p className="error" role="alert">{err}</p>}
          <label>Full address<textarea required rows={3} value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} placeholder="House, street, area, city" /></label>
          <label>Phone number<input required inputMode="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="03xx xxxxxxx" /></label>
          <div className="cod"><Icon name="cash" size={26} /><div><strong>Cash on delivery</strong><small>Keep {money(total)} ready when the order arrives.</small></div></div>
          <button className="btn btn-primary btn-lg btn-block" disabled={busy}>{busy ? 'Placing your order…' : `Place order, ${money(total)}`}</button>
        </form>

        <aside className="panel summary">
          <h3>Order summary</h3>
          {items.map((i) => (
            <div className="sline" key={i._id}>
              <div className="thumb" style={{ '--c': i.color || '#5b3df5' }}>{i.image ? <img src={i.image} alt="" /> : <span>{i.emoji}</span>}</div>
              <div className="grow"><strong>{i.name}</strong><small className="muted">Qty {i.qty}</small></div>
              <b>{money(i.price * i.qty)}</b>
            </div>
          ))}
          <hr />
          {coupon ? (
            <div className="coupon-on"><span><Icon name="percent" size={16} /> {coupon.code} ({coupon.percent}% off)</span><button type="button" className="link-btn" onClick={() => setCoupon(null)}>Remove</button></div>
          ) : (
            <>
              <div className="coupon">
                <input placeholder="Coupon code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), applyCoupon())} aria-label="Coupon code" />
                <button type="button" className="btn btn-dark btn-sm" onClick={applyCoupon}>Apply</button>
              </div>
              {cErr && <p className="error sm">{cErr}</p>}
            </>
          )}
          <div className="sum"><span>Subtotal</span><span>{money(subtotal)}</span></div>
          {discount > 0 && <div className="sum green"><span>Coupon discount</span><span>- {money(discount)}</span></div>}
          <div className="sum"><span>Delivery</span><span>{shipping ? money(shipping) : 'Free'}</span></div>
          <div className="sum big"><span>Total</span><span>{money(total)}</span></div>
          <Link to="/shop" className="muted sm">Continue shopping</Link>
        </aside>
      </div>
    </div>
  );
}
