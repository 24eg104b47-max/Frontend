import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Scene3D from '../components/Scene3D.jsx';
import Logo from '../components/Logo.jsx';
import { Page3D, TiltCard } from '../components/fx.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export function pwScore(pw) {
  let s = 0;
  if (pw.length >= 6) s++;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 5);
}

export const pwColor = ['#f87171', '#fb923c', '#fbbf24', '#a3e635', '#34d399'];

export default function Login() {
  const { login, demoLogin, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ usernameOrEmail: '', password: '' });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.usernameOrEmail || !form.password) {
      setError('Please fill in all fields.');
      return;
    }
    try {
      await login(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. You can also use Instant Demo Mode below.');
    }
  };

  const handleDemo = async () => {
    await demoLogin('Bannu');
    navigate('/dashboard');
  };

  return (
    <>
      <Scene3D theme="auth" />
      <Page3D>
        <div className="center-wrap">
          <TiltCard className="auth-card" glow="#38bdf8">
            <Logo to="/" size={34} />
            <div style={{ marginTop: 8 }}><Link to="/" className="muted" style={{ fontSize: 13 }}><ArrowLeft size={13} /> Back to landing</Link></div>
            <motion.h1 animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 3 }}>
              Welcome back 👋
            </motion.h1>
            <p className="muted">Login to float into your 3D task universe.</p>
            {error && <div className="alert error">{error}</div>}
            <form onSubmit={submit}>
              <label>Username or Email
                <input value={form.usernameOrEmail} onChange={(e) => setForm({ ...form, usernameOrEmail: e.target.value })} placeholder="demo" autoComplete="username" />
              </label>
              <label>Password
                <div className="pw-row">
                  <input type={show ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••" autoComplete="current-password" />
                  <button type="button" className="icon-btn" onClick={() => setShow((s) => !s)} aria-label="Toggle password visibility">
                    {show ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </label>
              <button className="btn primary big" disabled={loading}>{loading ? 'Entering 3D…' : 'Login →'}</button>
            </form>
            <div style={{ marginTop: 12 }}>
              <button type="button" className="btn ghost" style={{ width: '100%', borderColor: 'rgba(56,189,248,0.4)', color: 'var(--accent)' }} onClick={handleDemo}>
                🚀 Instant Demo Access (Bannu)
              </button>
            </div>
            <p className="muted" style={{ marginTop: 14 }}>No account? <Link to="/register">Register</Link></p>
          </TiltCard>
        </div>
      </Page3D>
    </>
  );
}
