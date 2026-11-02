import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import api from '../api';
import { useToast } from './ToastContext';

const Ctx = createContext();
export const useStore = () => useContext(Ctx);
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };

const BAG = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 7h12l1 13H5L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>';

// small bubble that flies from the button into the cart icon
function fly(fromEl) {
  const to = document.getElementById('cart-btn');
  if (!fromEl || !to || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const a = fromEl.getBoundingClientRect(), b = to.getBoundingClientRect();
  const dx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dy = b.top + b.height / 2 - (a.top + a.height / 2);
  const el = document.createElement('div');
  el.className = 'fly';
  el.innerHTML = BAG;
  el.style.left = a.left + a.width / 2 + 'px';
  el.style.top = a.top + a.height / 2 + 'px';
  document.body.appendChild(el);
  el.animate(
    [
      { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
      { transform: `translate(calc(-50% + ${dx * 0.55}px), calc(-50% + ${dy * 0.55 - 80}px)) scale(1.15)`, opacity: 1, offset: 0.5 },
      { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(.35)`, opacity: 0.5 },
    ],
    { duration: 700, easing: 'cubic-bezier(.4,.1,.3,1)' }
  ).onfinish = () => {
    el.remove();
    to.classList.remove('bump');
    void to.offsetWidth;
    to.classList.add('bump');
  };
}

export function StoreProvider({ children }) {
  const toast = useToast();
  const [items, setItems] = useState(() => load('cart', []));
  const [wish, setWish] = useState(() => load('wish', []));
  const [open, setOpen] = useState(false);
  const [cfg, setCfg] = useState({ freeShippingAbove: 3000, shippingFee: 200 });
  const ref = useRef(items);
  ref.current = items;

  useEffect(() => localStorage.setItem('cart', JSON.stringify(items)), [items]);
  useEffect(() => localStorage.setItem('wish', JSON.stringify(wish)), [wish]);
  const reloadSettings = useCallback(() => api.get('/settings').then((r) => setCfg(r.data)).catch(() => {}), []);
  useEffect(() => { reloadSettings(); }, [reloadSettings]);

  const add = (p, qty = 1, fromEl) => {
    const have = items.find((i) => i._id === p._id)?.qty || 0;
    if (have >= p.stock) { toast(`You already have all ${p.stock} in your cart`, 'warn'); return; }
    const row = {
      _id: p._id, name: p.name, price: p.price, image: p.image, stock: p.stock,
      emoji: p.category?.emoji, color: p.category?.color, qty: Math.min(have + qty, p.stock),
    };
    setItems((prev) => (prev.some((i) => i._id === p._id) ? prev.map((i) => (i._id === p._id ? row : i)) : [...prev, row]));
    fly(fromEl);
    toast(`${p.name} added to cart`);
  };
  const setQty = (id, q) => setItems((prev) => prev.map((i) => (i._id === id ? { ...i, qty: Math.max(1, Math.min(q, i.stock)) } : i)));
  const remove = (id) => setItems((prev) => prev.filter((i) => i._id !== id));
  const clear = () => setItems([]);
  const toggleWish = (id) => setWish((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id]));

  // cart only remembers a snapshot, so re-check price / stock / deleted products with the server
  const sync = useCallback(async () => {
    const cur = ref.current;
    if (!cur.length) return;
    try {
      const { data } = await api.get('/products', { params: { ids: cur.map((i) => i._id).join(',') } });
      const map = new Map(data.map((p) => [p._id, p]));
      let changed = false;
      const next = [];
      for (const i of cur) {
        const p = map.get(i._id);
        if (!p || p.stock < 1) { changed = true; continue; }
        const qty = Math.min(i.qty, p.stock);
        if (qty !== i.qty || p.price !== i.price || p.stock !== i.stock) changed = true;
        next.push({ ...i, name: p.name, price: p.price, image: p.image, stock: p.stock, qty });
      }
      setItems(next);
      if (changed) toast('Some items changed price or stock, so we updated your cart', 'warn');
    } catch { /* offline: keep what we have */ }
  }, [toast]);

  const count = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
  const shipping = subtotal === 0 || subtotal >= cfg.freeShippingAbove ? 0 : cfg.shippingFee;

  return (
    <Ctx.Provider value={{ items, add, setQty, remove, clear, count, subtotal, shipping, total: subtotal + shipping, cfg, reloadSettings, sync, wish, toggleWish, open, setOpen }}>
      {children}
    </Ctx.Provider>
  );
}
