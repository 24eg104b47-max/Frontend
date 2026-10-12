import { useEffect, useState } from 'react';
import { Eye, EyeOff, UserRound, KeyRound, BadgeCheck } from 'lucide-react';
import { Page3D, TiltCard } from '../components/fx.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';

export default function Profile() {
  const { user, syncSession } = useAuth();
  const [form, setForm] = useState({ username: '', email: '' });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [show, setShow] = useState({ cur: false, next: false });
  const [createdAt, setCreatedAt] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [pwMsg, setPwMsg] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/users/me')
      .then(({ data }) => {
        setForm({ username: data.username, email: data.email });
        setCreatedAt(data.createdAt ? new Date(data.createdAt).toLocaleDateString() : '');
      })
      .catch(() => {
        setForm({ username: user?.username || '', email: user?.email || '' });
        setMsg({ type: 'warn', text: 'Backend offline — showing cached profile.' });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    if (form.username.trim().length < 3) {
      setMsg({ type: 'error', text: 'Username must be at least 3 characters.' });
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.put('/users/me', {
        username: form.username.trim(), email: form.email.trim()
      });
      syncSession(data);
      setMsg({ type: 'ok', text: '✅ Profile updated.' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Update failed — is the backend running?' });
    } finally { setSaving(false); }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setPwMsg({ type: '', text: '' });
    if (pw.newPassword.length < 6) {
      setPwMsg({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }
    if (pw.newPassword !== pw.confirm) {
      setPwMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    try {
      const { data } = await api.put('/users/me/password', {
        currentPassword: pw.currentPassword, newPassword: pw.newPassword
      });
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
      setPwMsg({ type: 'ok', text: `✅ ${data.message}` });
    } catch (err) {
      setPwMsg({ type: 'error', text: err.response?.data?.message || 'Password change failed.' });
    }
  };

  return (
    <Page3D>
      <div className="container" style={{ maxWidth: 720 }}>
        <h1>Edit Profile 👤</h1>
        <p className="muted">Manage your identity and credentials.</p>

        <TiltCard className="panel" glow="#38bdf8">
          <div className="row" style={{ marginTop: 0, alignItems: 'center' }}>
            <span className="avatar" style={{ width: 56, height: 56, fontSize: 24 }}>
              {form.username?.[0]?.toUpperCase()}
            </span>
            <div>
              <h3 style={{ margin: 0 }}><UserRound size={16} /> {form.username || '…'}</h3>
              <span className="muted">{form.email}{createdAt ? ` • member since ${createdAt}` : ''}</span>
            </div>
          </div>
          {msg.text && <div className={`alert ${msg.type}`}>{msg.text}</div>}
          <form onSubmit={saveProfile}>
            <label>Username
              <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            </label>
            <label>Email
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </label>
            <div className="row">
              <button className="btn primary" disabled={saving}>{saving ? 'Saving…' : 'Save profile'}</button>
            </div>
          </form>
        </TiltCard>

        <TiltCard className="panel" glow="#a78bfa">
          <h3><KeyRound size={16} /> Change password</h3>
          <p className="muted">Passwords are BCrypt-hashed on the server — never stored in plain text.</p>
          {pwMsg.text && <div className={`alert ${pwMsg.type}`}>{pwMsg.text}</div>}
          <form onSubmit={savePassword}>
            <label>Current password
              <div className="pw-row">
                <input type={show.cur ? 'text' : 'password'} value={pw.currentPassword}
                  onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} autoComplete="current-password" />
                <button type="button" className="icon-btn" onClick={() => setShow({ ...show, cur: !show.cur })} aria-label="Show current password">
                  {show.cur ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </label>
            <label>New password
              <div className="pw-row">
                <input type={show.next ? 'text' : 'password'} value={pw.newPassword}
                  onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} autoComplete="new-password" />
                <button type="button" className="icon-btn" onClick={() => setShow({ ...show, next: !show.next })} aria-label="Show new password">
                  {show.next ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </label>
            <label>Confirm new password
              <input type="password" value={pw.confirm}
                onChange={(e) => setPw({ ...pw, confirm: e.target.value })} autoComplete="new-password" />
            </label>
            <div className="row">
              <button className="btn primary"><BadgeCheck size={15} /> Update password</button>
            </div>
          </form>
        </TiltCard>
      </div>
    </Page3D>
  );
}
