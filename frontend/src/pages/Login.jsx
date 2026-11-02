import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../api';
import AuthShell from './AuthShell';

export default function Login() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const from = useLocation().state?.from;
  const [f, setF] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr('');
    try {
      const u = await login(f.email, f.password);
      nav(u.role === 'admin' ? '/admin' : from || '/', { replace: true });
    } catch (e) { setErr(errMsg(e)); setBusy(false); }
  };

  return (
    <AuthShell>
      <form onSubmit={submit}>
        <h1>Welcome back</h1>
        <p className="muted">{from ? 'Login to continue to checkout.' : 'Login to your shaupex account.'}</p>
        {err && <p className="error" role="alert">{err}</p>}
        <label>Email<input type="email" required autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
        <label>Password<input type="password" required autoComplete="current-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></label>
        <button className="btn btn-primary btn-lg btn-block" disabled={busy}>{busy ? 'Logging in…' : 'Login'}</button>
        <p className="muted center">New to shaupex? <Link to="/register" state={{ from }}>Create an account</Link></p>
      </form>
    </AuthShell>
  );
}
