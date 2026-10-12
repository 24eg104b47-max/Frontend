import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { Page3D, TiltCard } from '../components/fx.jsx';
import api from '../services/api.js';

const beep = (on) => {
  if (!on) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    o.connect(ctx.destination);
    o.frequency.value = 880;
    o.start();
    setTimeout(() => { o.stop(); ctx.close(); }, 400);
  } catch { /* audio unsupported */ }
};

export default function Focus() {
  const [cfg, setCfg] = useState({ focusMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15 });
  const [mode, setMode] = useState('FOCUS');
  const [secsLeft, setSecsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [taskId, setTaskId] = useState('');
  const [sound, setSound] = useState(true);
  const [cycles, setCycles] = useState(0);
  const timer = useRef(null);

  const durations = { FOCUS: cfg.focusMinutes * 60, SHORT_BREAK: cfg.shortBreakMinutes * 60, LONG_BREAK: cfg.longBreakMinutes * 60 };

  useEffect(() => {
    api.get('/preferences').then(({ data }) => {
      const c = {
        focusMinutes: data.focusMinutes ?? 25,
        shortBreakMinutes: data.shortBreakMinutes ?? 5,
        longBreakMinutes: data.longBreakMinutes ?? 15
      };
      setCfg(c);
      setSecsLeft((s) => (mode === 'FOCUS' && !running ? c.focusMinutes * 60 : s));
    }).catch(() => {});
    api.get('/focus-sessions').then(({ data }) => setSessions(data)).catch(() => {});
    api.get('/tasks').then(({ data }) => setTasks(data.filter((t) => t.status !== 'COMPLETED'))).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!running) return;
    timer.current = setInterval(() => {
      setSecsLeft((s) => {
        if (s <= 1) {
          clearInterval(timer.current);
          finish();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, mode]);

  const finish = async () => {
    setRunning(false);
    beep(sound);
    const mins = Math.round(durations[mode] / 60);
    try {
      const { data } = await api.post('/focus-sessions', {
        kind: mode, minutesPlanned: mins, minutesActual: mins,
        taskId: taskId === '' ? null : Number(taskId)
      });
      setSessions((p) => [data, ...p]);
    } catch { /* offline */ }
    if (mode === 'FOCUS') {
      const c = cycles + 1;
      setCycles(c);
      setMode(c % 4 === 0 ? 'LONG_BREAK' : 'SHORT_BREAK');
      setSecsLeft(c % 4 === 0 ? durations.LONG_BREAK : durations.SHORT_BREAK);
    } else {
      setMode('FOCUS');
      setSecsLeft(durations.FOCUS);
    }
  };

  const switchMode = (m) => {
    setRunning(false);
    setMode(m);
    setSecsLeft(m === 'FOCUS' ? cfg.focusMinutes * 60 : m === 'SHORT_BREAK' ? cfg.shortBreakMinutes * 60 : cfg.longBreakMinutes * 60);
  };

  const total = durations[mode];
  const pct = total ? (1 - secsLeft / total) : 0;
  const R = 100;
  const C = 2 * Math.PI * R;
  const mm = String(Math.floor(secsLeft / 60)).padStart(2, '0');
  const ss = String(secsLeft % 60).padStart(2, '0');
  const todayMin = sessions.filter((s) => s.kind === 'FOCUS').reduce((a, s) => a + (s.minutesActual || 0), 0);

  return (
    <Page3D>
      <div className="container" style={{ maxWidth: 760 }}>
        <h1>Focus Mode 🎯</h1>
        <p className="muted">25-minute sprints, real persisted sessions. Today: <b>{todayMin} focus min</b> • {cycles} cycles done.</p>
        <TiltCard className="panel" glow="#f472b6">
          <div className="seg" style={{ maxWidth: 420, margin: '0 auto' }}>
            {['FOCUS', 'SHORT_BREAK', 'LONG_BREAK'].map((m) => (
              <button key={m} type="button" className={mode === m ? 'on' : ''} onClick={() => switchMode(m)}>
                {m.replace('_', ' ').toLowerCase()}
              </button>
            ))}
          </div>
          <div className="timer-ring" style={{ marginTop: 18 }}>
            <svg viewBox="0 0 240 240" width="240">
              <circle cx="120" cy="120" r={R} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="14" />
              <motion.circle cx="120" cy="120" r={R} fill="none" stroke="#f472b6" strokeWidth="14"
                strokeLinecap="round" strokeDasharray={C}
                animate={{ strokeDashoffset: C * (1 - pct) }} transform="rotate(-90 120 120)" />
            </svg>
            <div className="timer-label"><div><b>{mm}:{ss}</b><div className="muted">{mode.replace(/_/g, ' ').toLowerCase()}</div></div></div>
          </div>
          <label style={{ maxWidth: 420, margin: '14px auto 0', display: 'block' }}>Focusing on
            <select value={taskId} onChange={(e) => setTaskId(e.target.value)}>
              <option value="">— just focus —</option>
              {tasks.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          </label>
          <div className="row" style={{ maxWidth: 420, margin: '14px auto 0' }}>
            {!running
              ? <button className="btn primary big" onClick={() => setRunning(true)}><Play size={16} /> Start</button>
              : <button className="btn big" onClick={() => setRunning(false)}><Pause size={16} /> Pause</button>}
            <button className="btn ghost" onClick={() => { setRunning(false); setSecsLeft(durations[mode]); }}><RotateCcw size={16} /></button>
            <button className="btn ghost" onClick={() => setSound((s) => !s)}>{sound ? <Volume2 size={16} /> : <VolumeX size={16} />}</button>
          </div>
          <div className="grid2form" style={{ maxWidth: 420, margin: '12px auto 0' }}>
            <label>Focus (min)<input type="number" min="5" value={cfg.focusMinutes} onChange={(e) => setCfg({ ...cfg, focusMinutes: Number(e.target.value) })} /></label>
            <label>Short break<input type="number" min="1" value={cfg.shortBreakMinutes} onChange={(e) => setCfg({ ...cfg, shortBreakMinutes: Number(e.target.value) })} /></label>
          </div>
        </TiltCard>
        <TiltCard className="panel" glow="#38bdf8">
          <h3>Recent sessions (persisted)</h3>
          {sessions.slice(0, 6).map((s) => (
            <div key={s.id} className="recent-row">
              <span className="badge" style={{ background: 'rgba(56,189,248,.15)', color: '#7dd3fc' }}>{s.kind}</span>
              <span className="rtitle">{s.minutesActual} min{s.taskId ? ` • task #${s.taskId}` : ''}</span>
            </div>
          ))}
          {sessions.length === 0 && <p className="muted">No sessions yet — finish one to earn the Focus Champion badge 🏅</p>}
        </TiltCard>
      </div>
    </Page3D>
  );
}
