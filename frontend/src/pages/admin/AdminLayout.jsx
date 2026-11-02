import { Link, NavLink, Outlet } from 'react-router-dom';
import Icon from '../../components/Icon';
import Logo from '../../components/Logo';

const LINKS = [
  ['/admin', 'Dashboard', 'grid', true],
  ['/admin/products', 'Products', 'box'],
  ['/admin/categories', 'Categories', 'tag'],
  ['/admin/orders', 'Orders', 'receipt'],
  ['/admin/coupons', 'Coupons', 'percent'],
  ['/admin/settings', 'Delivery settings', 'sliders'],
  ['/admin/messages', 'Messages', 'inbox'],
];

export default function AdminLayout() {
  return (
    <div className="admin">
      <aside className="side">
        <Link to="/admin" className="side-logo"><Logo light /></Link>
        <nav>
          {LINKS.map(([to, label, ic, end]) => (
            <NavLink key={to} to={to} end={end}><Icon name={ic} size={18} /> {label}</NavLink>
          ))}
        </nav>
        <Link to="/" className="side-store"><Icon name="store" size={18} /> View store</Link>
      </aside>
      <section className="admin-main"><Outlet /></section>
    </div>
  );
}
