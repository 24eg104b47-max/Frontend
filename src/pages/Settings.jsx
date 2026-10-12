import { useEffect, useState } from 'react';
import { Page3D, TiltCard } from '../components/fx.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import api from '../services/api.js';

export default function Settings() {
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  const [accent, setAccent] = useState(localStorage.getItem('stm_accent') || '#38bdf8');
  const [prefs, setPrefs] = useState({ focusMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15, notifyOverdue: true });
  const [ok, setOk] = useState('');

  useEffect(() => {
    api.get('/preferences').then(({ data }) => {
      setPrefs({
        focusMinutes: data.focusMinutes ?? 25,
        shortBreakMinutes: data.shortBreakMinutes ?? 5,
        longBreakMinutes: data.longBreakMinutes ?? 15,
        notifyOverdue: data.notifyOverdue ?? true
      });
      if (data.accent) setAccent(data.accent);
    }).catch(() => {});
  }, []);

  const save = async () => {
    localStorage.setItem('stm_accent', accent);
    document.documentElement.style.setProperty('--accent', accent);
    try {
      const cur = (await api.get('/preferences')).data;
      await api.put('/preferences', { ...cur, accent, ...prefs });
    } catch { /* offline */ }
    setOk('Settings saved across the galaxy ✨');
    setTimeout(() => setOk(''), 2000);
  };

  return (
    <Page3D>
      <div className="container">
        <h1>Settings ⚙️</h1>
        <p className="muted">Signed in as <b>{user?.username}</b> ({user?.email})</p>
        <TiltCard className="panel" glow={accent}>
          <h3>Appearance</h3>
          <div className="row" style={{ alignItems: 'center' }}>
            <span>Theme: <b>{theme}</b></span>
            <button className="btn ghost" onClick={toggle}>Switch to {theme === 'dark' ? 'light' : 'dark'}</button>
          </div>
          <h3>Accent color</h3>
          <div className="swatches">
            {['#38bdf8', '#a78bfa', '#34d399', '#fbbf24', '#f472b6'].map((c) => (
              <button key={c} className={`sw ${accent === c ? 'on' : ''}`} style={{ background: c }} onClick={() => setAccent(c)} aria-label={c} />
            ))}
          </div>
          <div className="grid2form">
            <label>Focus minutes
              <input type="number" min="5" max="120" value={prefs.focusMinutes} onChange={(e) => setPrefs({ ...prefs, focusMinutes: Number(e.target.value) })} />
            </label>
            <label>Short break
              <input type="number" min="1" max="60" value={prefs.shortBreakMinutes} onChange={(e) => setPrefs({ ...prefs, shortBreakMinutes: Number(e.target.value) })} />
            </label>
          </div>
          <div className="grid2form">
            <label>Long break
              <input type="number" min="5" max="60" value={prefs.longBreakMinutes} onChange={(e) => setPrefs({ ...prefs, longBreakMinutes: Number(e.target.value) })} />
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>Overdue reminders
              <input type="checkbox" style={{ width: 20 }} checked={prefs.notifyOverdue} onChange={(e) => setPrefs({ ...prefs, notifyOverdue: e.target.checked })} />
            </label>
          </div>
          <div className="row">
            <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} style={{ maxWidth: 60 }} />
            <button className="btn primary" onClick={save}>Save</button>
          </div>
          {ok && <div className="alert ok">{ok}</div>}
        </TiltCard>
        <TiltCard className="panel" glow="#a78bfa">
          <h3>Backend</h3>
          <p className="muted">API: <code>{import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}</code></p>
          <p className="muted">Run backend with <code>mvn spring-boot:run</code> + MySQL <code>smart_task_manager</code>.</p>
        </TiltCard>
      </div>
    </Page3D>
  );
}
