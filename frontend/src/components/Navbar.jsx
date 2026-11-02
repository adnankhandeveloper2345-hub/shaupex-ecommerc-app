import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import Icon from './Icon';
import Logo from './Logo';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count, setOpen, wish, cfg } = useStore();
  const nav = useNavigate();
  const loc = useLocation();
  const [cats, setCats] = useState([]);
  const [q, setQ] = useState('');
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef();
  const params = new URLSearchParams(loc.search);
  const onShop = loc.pathname === '/shop';
  const admin = user?.role === 'admin';

  useEffect(() => { api.get('/categories').then((r) => setCats(r.data)).catch(() => {}); }, []);
  useEffect(() => { setQ(onShop ? params.get('q') || '' : ''); setMenu(false); }, [loc.pathname, loc.search]); // eslint-disable-line
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 6);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => {
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenu(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const search = (e) => {
    e.preventDefault();
    nav(q.trim() ? `/shop?q=${encodeURIComponent(q.trim())}` : '/shop');
  };
  const cur = onShop ? params.get('category') : null;
  const sale = onShop && params.get('sale') === '1';

  return (
    <>
      <div className="announce">
        <Icon name="truck" size={16} />
        <span>
          Cash on delivery on every order.{' '}
          {cfg.freeShippingAbove > 0 ? `Free delivery above Rs. ${cfg.freeShippingAbove.toLocaleString()}.` : 'Free delivery on all orders.'}
        </span>
      </div>
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <div className="container header-row">
          <Link to="/" className="logo-link" aria-label="shaupex home"><Logo /></Link>

          <form className="hsearch" onSubmit={search} role="search">
            <Icon name="search" size={18} />
            <input type="search" placeholder="Search for products" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search products" />
          </form>

          <div className="hactions">
            {!admin && (
              <Link className="iconbtn" to="/wishlist" aria-label={`Wishlist, ${wish.length} saved`}>
                <Icon name="heart" />{wish.length > 0 && <i className="dot">{wish.length}</i>}
              </Link>
            )}
            {user ? (
              <div className="usermenu" ref={menuRef}>
                <button className="avatar" onClick={() => setMenu((m) => !m)} aria-label="Account menu" aria-expanded={menu}>
                  {user.name.trim()[0]?.toUpperCase()}
                </button>
                {menu && (
                  <div className="dropdown">
                    <div className="dd-head"><strong>{user.name}</strong><small>{user.email}</small></div>
                    {admin
                      ? <Link to="/admin"><Icon name="grid" size={17} /> Admin dashboard</Link>
                      : <Link to="/orders"><Icon name="receipt" size={17} /> My orders</Link>}
                    <button onClick={() => { logout(); setMenu(false); nav('/'); }}><Icon name="logout" size={17} /> Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link className="btn btn-ghost btn-sm hide-sm" to="/login">Login</Link>
                <Link className="btn btn-primary btn-sm hide-sm" to="/register">Sign up</Link>
                <Link className="iconbtn show-sm" to="/login" aria-label="Login"><Icon name="user" /></Link>
              </>
            )}
            {!admin && (
              <button id="cart-btn" className="iconbtn cart" onClick={() => setOpen(true)} aria-label={`Open cart, ${count} items`}>
                <Icon name="bag" />{count > 0 && <i className="dot">{count}</i>}
              </button>
            )}
          </div>
        </div>

        <nav className="catnav" aria-label="Categories">
          <div className="container catnav-row">
            <div className="catlinks">
              <Link to="/shop" className={onShop && !cur && !sale ? 'on' : ''}>All products</Link>
              {cats.map((c) => (
                <Link key={c._id} to={`/shop?category=${c.slug}`} className={cur === c.slug ? 'on' : ''}>{c.name}</Link>
              ))}
              <Link to="/shop?sale=1" className={`sale-link ${sale ? 'on' : ''}`}>Sale</Link>
            </div>
            <div className="catextra">
              <Link to="/about">About</Link>
              <Link to="/contact">Contact</Link>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
}
