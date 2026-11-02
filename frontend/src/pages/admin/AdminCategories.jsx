import { useEffect, useState } from 'react';
import api, { errMsg } from '../../api';
import { useToast } from '../../context/ToastContext';

const COLORS = ['#e0457b', '#8b5cf6', '#3b82f6', '#0ea5a0', '#16a34a', '#f59e0b', '#ef4444', '#5b3df5'];
const EMPTY = { name: '', emoji: '🛍️', color: COLORS[0] };

export default function AdminCategories() {
  const toast = useToast();
  const [list, setList] = useState([]);
  const [f, setF] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [err, setErr] = useState('');

  const load = () => api.get('/categories').then((r) => setList(r.data));
  useEffect(() => { load(); }, []);
  const reset = () => { setF(EMPTY); setEditId(null); setErr(''); };

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editId) await api.put(`/categories/${editId}`, f); else await api.post('/categories', f);
      toast(editId ? 'Category updated' : 'Category added');
      reset(); load();
    } catch (e) { setErr(errMsg(e)); }
  };
  const del = async (c) => {
    if (!confirm(`Delete category "${c.name}"?`)) return;
    try { await api.delete(`/categories/${c._id}`); toast('Category deleted'); load(); }
    catch (e) { toast(errMsg(e), 'warn'); }
  };

  return (
    <>
      <div className="admin-head"><h1>Categories</h1></div>
      <form className="panel" onSubmit={submit}>
        <h3>{editId ? 'Edit category' : 'New category'}</h3>
        {err && <p className="error" role="alert">{err}</p>}
        <div className="form-grid">
          <label>Name<input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g. Beauty Products" /></label>
          <label>Emoji<input value={f.emoji} maxLength={8} onChange={(e) => setF({ ...f, emoji: e.target.value })} /></label>
        </div>
        <fieldset className="swatches">
          <legend>Color</legend>
          {COLORS.map((c) => <button type="button" key={c} className={f.color === c ? 'on' : ''} style={{ background: c }} onClick={() => setF({ ...f, color: c })} aria-label={`Color ${c}`} />)}
        </fieldset>
        <div className="row gap">
          <button className="btn btn-primary">{editId ? 'Save changes' : 'Add category'}</button>
          {editId && <button type="button" className="btn btn-ghost" onClick={reset}>Cancel</button>}
        </div>
      </form>

      <div className="cat-list">
        {list.map((c) => (
          <div className="cat-item" key={c._id} style={{ '--c': c.color }}>
            <b>{c.emoji}</b>
            <div className="grow"><strong>{c.name}</strong><br /><small className="muted">{c.productCount} product{c.productCount === 1 ? '' : 's'}</small></div>
            <button className="link-btn" onClick={() => { setEditId(c._id); setF({ name: c.name, emoji: c.emoji, color: c.color }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Edit</button>
            <button className="link-btn danger" onClick={() => del(c)}>Delete</button>
          </div>
        ))}
      </div>
    </>
  );
}
