import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Scene3D from '../components/Scene3D.jsx';
import Logo from '../components/Logo.jsx';
import { Page3D, TiltCard } from '../components/fx.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { pwScore, pwColor } from './Login.jsx';

const labels = ['Too weak', 'Weak', 'Okay', 'Good', 'Strong'];

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const score = pwScore(form.password);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.username || !form.email || !form.password) {
      setError('All fields are required.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    }
  };

  return (
    <>
      <Scene3D theme="auth" />
      <Page3D>
        <div className="center-wrap">
          <TiltCard className="auth-card" glow="#a78bfa">
            <Logo to="/" size={34} />
            <div style={{ marginTop: 8 }}><Link to="/" className="muted" style={{ fontSize: 13 }}><ArrowLeft size={13} /> Back to landing</Link></div>
            <h1>Create your 3D space 🚀</h1>
            <p className="muted">Register to organize, track and complete tasks.</p>
            {error && <div className="alert error">{error}</div>}
            <form onSubmit={submit}>
              <label>Username
                <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="alex" autoComplete="username" />
              </label>
              <label>Email
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="alex@mail.com" autoComplete="email" />
              </label>
              <label>Password
                <div className="pw-row">
                  <input type={show ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="min 6 chars" autoComplete="new-password" />
                  <button type="button" className="icon-btn" onClick={() => setShow((s) => !s)} aria-label="Toggle password visibility">
                    {show ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {form.password && (
                  <>
                    <div className="pw-meter"><div style={{ width: `${score * 20}%`, background: pwColor[score - 1] || '#f87171' }} /></div>
                    <small className="muted">{labels[score - 1] || labels[0]} — use 10+ chars, mixed case, numbers, symbols.</small>
                  </>
                )}
              </label>
              <button className="btn primary big" disabled={loading}>{loading ? 'Creating…' : 'Register →'}</button>
            </form>
            <p className="muted">Have an account? <Link to="/login">Login</Link></p>
          </TiltCard>
        </div>
      </Page3D>
    </>
  );
}
