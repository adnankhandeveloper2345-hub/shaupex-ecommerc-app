import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { money } from '../api';
import Icon from './Icon';

export default function CartDrawer() {
  const { open, setOpen, items, setQty, remove, subtotal, shipping, total, cfg, sync } = useStore();
  const nav = useNavigate();

  useEffect(() => { if (open) sync(); }, [open]); // eslint-disable-line
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setOpen]);

  const left = cfg.freeShippingAbove - subtotal;
  const pct = cfg.freeShippingAbove > 0 ? Math.min(100, Math.round((subtotal / cfg.freeShippingAbove) * 100)) : 100;

  return (
    <>
      <div className={`overlay ${open ? 'show' : ''}`} onClick={() => setOpen(false)} />
      <aside className={`drawer ${open ? 'open' : ''}`} aria-hidden={!open} aria-label="Shopping cart">
        <div className="drawer-head">
          <h2>Shopping cart</h2>
          <button className="iconbtn" onClick={() => setOpen(false)} aria-label="Close cart"><Icon name="close" /></button>
        </div>

        {items.length === 0 ? (
          <div className="empty">
            <div className="empty-ic"><Icon name="bag" size={34} /></div>
            <h3>Your cart is empty</h3>
            <p>Looks like you have not added anything yet.</p>
            <button className="btn btn-primary" onClick={() => { setOpen(false); nav('/shop'); }}>Start shopping</button>
          </div>
        ) : (
          <>
            {cfg.freeShippingAbove > 0 && (
              <div className="shipbar">
                <p>{left > 0 ? <>Add <b>{money(left)}</b> more to get free delivery</> : <b>You have unlocked free delivery</b>}</p>
                <div className="bar"><i style={{ width: pct + '%' }} /></div>
              </div>
            )}
            <div className="drawer-list">
              {items.map((i) => (
                <div className="line" key={i._id}>
                  <div className="thumb" style={{ '--c': i.color || '#5b3df5' }}>
                    {i.image ? <img src={i.image} alt="" /> : <span>{i.emoji || '🛍️'}</span>}
                  </div>
                  <div className="grow">
                    <strong>{i.name}</strong>
                    <div className="muted sm">{money(i.price)}</div>
                    <div className="qty">
                      <button onClick={() => setQty(i._id, i.qty - 1)} aria-label="Decrease"><Icon name="minus" size={14} /></button>
                      <span>{i.qty}</span>
                      <button onClick={() => setQty(i._id, i.qty + 1)} disabled={i.qty >= i.stock} aria-label="Increase"><Icon name="plus" size={14} /></button>
                    </div>
                  </div>
                  <div className="right">
                    <b>{money(i.price * i.qty)}</b>
                    <button className="iconbtn sm" onClick={() => remove(i._id)} aria-label={`Remove ${i.name}`}><Icon name="trash" size={17} /></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="drawer-foot">
              <div className="sum"><span>Subtotal</span><span>{money(subtotal)}</span></div>
              <div className="sum"><span>Delivery</span><span>{shipping ? money(shipping) : 'Free'}</span></div>
              <div className="sum big"><span>Total (pay on delivery)</span><span>{money(total)}</span></div>
              <button className="btn btn-primary btn-lg btn-block" onClick={() => { setOpen(false); nav('/checkout'); }}>Checkout</button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
