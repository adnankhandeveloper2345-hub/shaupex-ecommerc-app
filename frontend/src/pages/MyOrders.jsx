import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api, { errMsg, money } from '../api';
import Confetti from '../components/Confetti';
import Icon from '../components/Icon';
import { useToast } from '../context/ToastContext';

const STEPS = ['Placed', 'Shipped', 'Delivered'];
const at = { Pending: 0, Shipped: 1, Delivered: 2 };

export default function MyOrders() {
  const placed = useLocation().state?.placed;
  const toast = useToast();
  const [orders, setOrders] = useState(null);
  const load = () => api.get('/orders/my').then((r) => setOrders(r.data)).catch(() => setOrders([]));
  useEffect(() => { load(); }, []);

  const cancel = async (o) => {
    if (!confirm('Cancel this order?')) return;
    try { await api.put(`/orders/${o._id}/cancel`); toast('Order cancelled'); load(); }
    catch (e) { toast(errMsg(e), 'warn'); load(); }
  };

  return (
    <div className="container section">
      {placed && <Confetti />}
      {placed && <div className="banner"><Icon name="check" size={20} /> Thank you! Your order has been placed. Please keep cash ready for delivery.</div>}
      <h1 className="page-h1">My orders</h1>
      {orders === null ? <div className="skel tall" />
        : orders.length === 0 ? <div className="empty"><div className="empty-ic"><Icon name="receipt" size={32} /></div><h3>No orders yet</h3><p>When you place an order it will show up here.</p><Link className="btn btn-primary" to="/shop">Start shopping</Link></div>
        : orders.map((o) => (
          <div className="panel order" key={o._id}>
            <div className="row between wrap">
              <div><strong>Order #{o._id.slice(-6).toUpperCase()}</strong><br /><small className="muted">{new Date(o.createdAt).toLocaleString()}</small></div>
              {o.status === 'Cancelled' ? <span className="status Cancelled">Cancelled</span> : (
                <ol className="steps" aria-label={`Status: ${o.status}`}>
                  {STEPS.map((s, i) => <li key={s} className={i <= at[o.status] ? 'done' : ''}>{s}</li>)}
                </ol>
              )}
            </div>
            <div className="lines">
              {o.items.map((i, k) => <div className="sum" key={k}><span>{i.name} × {i.qty}</span><span>{money(i.price * i.qty)}</span></div>)}
              {o.discount > 0 && <div className="sum green"><span>Coupon {o.coupon}</span><span>- {money(o.discount)}</span></div>}
              <div className="sum"><span>Delivery</span><span>{o.shipping ? money(o.shipping) : 'Free'}</span></div>
              <div className="sum big"><span>Pay on delivery</span><span>{money(o.total)}</span></div>
            </div>
            <div className="row between wrap">
              <small className="muted">Deliver to: {o.address}, {o.phone}</small>
              {o.status === 'Pending' && <button className="btn btn-ghost btn-sm" onClick={() => cancel(o)}>Cancel order</button>}
            </div>
          </div>
        ))}
    </div>
  );
}
