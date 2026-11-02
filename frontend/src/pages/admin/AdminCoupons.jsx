import { useEffect, useState } from 'react';
import api, { errMsg, money } from '../../api';
import { useToast } from '../../context/ToastContext';

const EMPTY = { code: '', percent: '', minOrder: '', active: true };

export default function AdminCoupons() {
  const toast = useToast();
  const [list, setList] = useState([]);
  const [f, setF] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [err, setErr] = useState('');

  const load = () => api.get('/coupons').then((r) => setList(r.data));
  useEffect(() => { load(); }, []);
  const reset = () => { setF(EMPTY); setEditId(null); setErr(''); };

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editId) await api.put(`/coupons/${editId}`, f); else await api.post('/coupons', f);
      toast(editId ? 'Coupon updated' : 'Coupon created');
      reset(); load();
    } catch (e) { setErr(errMsg(e)); }
  };
  const toggle = async (c) => {
    try { await api.put(`/coupons/${c._id}`, { ...c, active: !c.active }); load(); } catch (e) { toast(errMsg(e), 'warn'); }
  };
  const del = async (c) => {
    if (!confirm(`Delete coupon ${c.code}?`)) return;
    try { await api.delete(`/coupons/${c._id}`); toast('Coupon deleted'); load(); } catch (e) { toast(errMsg(e), 'warn'); }
  };

  return (
    <>
      <div className="admin-head"><h1>Coupons</h1></div>
      <form className="panel" onSubmit={submit}>
        <h3>{editId ? 'Edit coupon' : 'New coupon'}</h3>
        {err && <p className="error" role="alert">{err}</p>}
        <div className="form-grid">
          <label>Code<input required value={f.code} onChange={(e) => setF({ ...f, code: e.target.value.toUpperCase() })} placeholder="e.g. WELCOME10" maxLength={20} /></label>
          <label>Discount %<input type="number" required min="1" max="90" value={f.percent} onChange={(e) => setF({ ...f, percent: e.target.value })} /></label>
          <label>Minimum order (Rs.) <small className="muted">(0 for none)</small><input type="number" min="0" value={f.minOrder} onChange={(e) => setF({ ...f, minOrder: e.target.value })} /></label>
        </div>
        <label className="check"><input type="checkbox" checked={f.active} onChange={(e) => setF({ ...f, active: e.target.checked })} /> Active (customers can use it)</label>
        <div className="row gap">
          <button className="btn btn-primary">{editId ? 'Save changes' : 'Create coupon'}</button>
          {editId && <button type="button" className="btn btn-ghost" onClick={reset}>Cancel</button>}
        </div>
      </form>

      <div className="panel table-wrap">
        <table>
          <thead><tr><th>Code</th><th>Discount</th><th>Min order</th><th>Used</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {list.map((c) => (
              <tr key={c._id}>
                <td><code className="code">{c.code}</code></td>
                <td>{c.percent}%</td>
                <td>{c.minOrder ? money(c.minOrder) : 'None'}</td>
                <td>{c.usedCount}</td>
                <td><button className={`status ${c.active ? 'Delivered' : 'Cancelled'} clickable`} onClick={() => toggle(c)}>{c.active ? 'Active' : 'Off'}</button></td>
                <td className="actions">
                  <button className="link-btn" onClick={() => { setEditId(c._id); setF({ code: c.code, percent: c.percent, minOrder: c.minOrder || '', active: c.active }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Edit</button>
                  <button className="link-btn danger" onClick={() => del(c)}>Delete</button>
                </td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan="6" className="muted">No coupons yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
