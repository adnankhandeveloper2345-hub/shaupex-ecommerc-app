import { useEffect, useState } from 'react';
import api, { errMsg, money, STATUS_NEXT } from '../../api';
import { useToast } from '../../context/ToastContext';

const TABS = ['All', 'Pending', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrders() {
  const toast = useToast();
  const [orders, setOrders] = useState(null);
  const [tab, setTab] = useState('All');
  const load = () => api.get('/orders').then((r) => setOrders(r.data));
  useEffect(() => { load(); }, []);

  const change = async (o, status) => {
    if (status === 'Cancelled' && !confirm('Cancel this order? Stock goes back to the shelf.')) return;
    try { await api.put(`/orders/${o._id}/status`, { status }); toast(`Order marked ${status}`); } catch (e) { toast(errMsg(e), 'warn'); }
    load();
  };

  if (!orders) return <div className="skel tall" />;
  const count = (t) => (t === 'All' ? orders.length : orders.filter((o) => o.status === t).length);
  const shown = tab === 'All' ? orders : orders.filter((o) => o.status === tab);

  return (
    <>
      <div className="admin-head"><h1>Orders</h1></div>
      <div className="tabs">
        {TABS.map((t) => <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t} <span>{count(t)}</span></button>)}
      </div>
      {shown.length === 0 && <div className="empty"><h3>No orders here</h3></div>}
      {shown.map((o) => (
        <div className="panel order" key={o._id}>
          <div className="row between wrap">
            <div>
              <strong>{o.user?.name || 'Deleted user'}</strong> <small className="muted">{o.user?.email}</small><br />
              <small className="muted">Order #{o._id.slice(-6).toUpperCase()}, {new Date(o.createdAt).toLocaleString()}</small>
            </div>
            <div className="row gap wrap">
              <span className={`status ${o.status}`}>{o.status}</span>
              {STATUS_NEXT[o.status].map((s) => (
                <button key={s} className={`btn btn-sm ${s === 'Cancelled' ? 'btn-ghost' : 'btn-primary'}`} onClick={() => change(o, s)}>
                  {s === 'Cancelled' ? 'Cancel' : `Mark ${s.toLowerCase()}`}
                </button>
              ))}
            </div>
          </div>
          <div className="lines">
            {o.items.map((i, k) => <div className="sum" key={k}><span>{i.name} × {i.qty}</span><span>{money(i.price * i.qty)}</span></div>)}
            {o.discount > 0 && <div className="sum green"><span>Coupon {o.coupon}</span><span>- {money(o.discount)}</span></div>}
            <div className="sum"><span>Delivery</span><span>{o.shipping ? money(o.shipping) : 'Free'}</span></div>
            <div className="sum big"><span>Collect cash</span><span>{money(o.total)}</span></div>
          </div>
          <small className="muted">Deliver to: {o.address}, {o.phone}</small>
        </div>
      ))}
    </>
  );
}
