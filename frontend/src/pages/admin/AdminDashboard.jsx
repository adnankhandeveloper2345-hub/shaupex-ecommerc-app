import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { money } from '../../api';
import Icon from '../../components/Icon';

export default function AdminDashboard() {
  const [s, setS] = useState(null);
  useEffect(() => { api.get('/admin/stats').then((r) => setS(r.data)); }, []);
  if (!s) return <div className="skel tall" />;

  const tiles = [
    ['Revenue (delivered)', money(s.revenue), 'cash', `${s.orders.Delivered} orders delivered`],
    ['Pending orders', s.orders.Pending, 'receipt', `${s.orders.Shipped} on the way`],
    ['Products', s.products, 'box', `${s.categories} categories`],
    ['Customers', s.customers, 'user', 'registered accounts'],
    ['New messages', s.unread, 'inbox', 'unread from contact form'],
  ];

  return (
    <>
      <div className="admin-head"><h1>Dashboard</h1></div>
      {!s.cloudinary && (
        <div className="notice"><Icon name="help" size={20} /><div><strong>Photos are saved locally.</strong> Add your Cloudinary keys in <code>backend/.env</code> so product photos are stored online.</div></div>
      )}
      <div className="tiles">
        {tiles.map(([label, val, ic, sub]) => (
          <div className="tile" key={label}>
            <span className="tile-ic"><Icon name={ic} size={20} /></span>
            <small>{label}</small><b>{val}</b><small className="muted">{sub}</small>
          </div>
        ))}
      </div>

      <div className="two">
        <div className="panel">
          <h3>Running low on stock</h3>
          {s.lowStock.length === 0 ? <p className="muted">All products are well stocked.</p> : s.lowStock.map((p) => (
            <div className="sum" key={p._id}>
              <span>{p.name}</span>
              <span className={p.stock === 0 ? 'danger' : 'warn'}>{p.stock === 0 ? 'Sold out' : `${p.stock} left`}</span>
            </div>
          ))}
          <Link className="btn btn-ghost btn-sm" to="/admin/products">Manage products</Link>
        </div>
        <div className="panel">
          <h3>Latest orders</h3>
          {s.recent.length === 0 ? <p className="muted">No orders yet.</p> : s.recent.map((o) => (
            <div className="sum" key={o._id}>
              <span>{o.user?.name || 'Deleted user'} <span className={`status ${o.status}`}>{o.status}</span></span>
              <span>{money(o.total)}</span>
            </div>
          ))}
          <Link className="btn btn-ghost btn-sm" to="/admin/orders">See all orders</Link>
        </div>
      </div>
    </>
  );
}
