import { useEffect, useState } from 'react';
import api, { errMsg } from '../../api';
import Icon from '../../components/Icon';
import { useToast } from '../../context/ToastContext';

export default function AdminMessages() {
  const toast = useToast();
  const [list, setList] = useState(null);
  const load = () => api.get('/messages').then((r) => setList(r.data));
  useEffect(() => { load(); }, []);

  const mark = async (m, read) => { try { await api.put(`/messages/${m._id}/read`, { read }); load(); } catch (e) { toast(errMsg(e), 'warn'); } };
  const del = async (m) => {
    if (!confirm('Delete this message?')) return;
    try { await api.delete(`/messages/${m._id}`); toast('Message deleted'); load(); } catch (e) { toast(errMsg(e), 'warn'); }
  };

  if (!list) return <div className="skel tall" />;
  return (
    <>
      <div className="admin-head"><h1>Messages</h1></div>
      {list.length === 0 && <div className="empty"><div className="empty-ic"><Icon name="inbox" size={32} /></div><h3>No messages yet</h3><p>Messages from the contact page show up here.</p></div>}
      {list.map((m) => (
        <div className={`panel msg ${m.read ? '' : 'unread'}`} key={m._id}>
          <div className="row between wrap">
            <div><strong>{m.name}</strong> <small className="muted">{m.email}</small><br /><small className="muted">{new Date(m.createdAt).toLocaleString()}</small></div>
            {!m.read && <span className="status Pending">New</span>}
          </div>
          {m.subject && <h4>{m.subject}</h4>}
          <p className="msg-body">{m.message}</p>
          <div className="row gap wrap">
            <a className="btn btn-primary btn-sm" href={`mailto:${m.email}?subject=${encodeURIComponent('Re: ' + (m.subject || 'Your message to shaupex'))}`} onClick={() => !m.read && mark(m, true)}>Reply by email</a>
            <button className="btn btn-ghost btn-sm" onClick={() => mark(m, !m.read)}>{m.read ? 'Mark as unread' : 'Mark as read'}</button>
            <button className="link-btn danger" onClick={() => del(m)}>Delete</button>
          </div>
        </div>
      ))}
    </>
  );
}
