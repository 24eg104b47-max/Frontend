import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, CheckCircle2, Timer, KanbanSquare,
  BarChart3, LogIn, MousePointer2, Server, Database, CalendarDays, Bell
} from 'lucide-react';
import Scene3D from '../components/Scene3D.jsx';
import Logo from '../components/Logo.jsx';
import { Page3D } from '../components/fx.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';

const line = {
  hidden: { opacity: 0, y: 50 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: 0.15 + i * 0.18, duration: 0.7, ease: [0.22, 1, 0.36, 1] } })
};

const feats = [
  { icon: KanbanSquare, t: '3D Kanban Board', d: 'Drag cards To Do → In Progress → In Review → Done. Every drop is a PATCH with ownership checks.' },
  { icon: Timer, t: 'Focus & Pomodoro', d: 'Distraction-free timer. Sessions persist to the backend and earn the Focus Champion badge.' },
  { icon: BarChart3, t: 'Real Analytics', d: 'Weekly bars, trend lines and distributions from /api/dashboard/productivity — never hardcoded.' },
  { icon: CalendarDays, t: 'Interactive Calendar', d: 'Month-at-a-glance scheduling with color-coded deadline badges and quick day filtering.' },
  { icon: CheckCircle2, t: 'Gamification', d: 'XP, levels and badges computed from stored completion events. No toggle-farming.' },
  { icon: Bell, t: 'Instant Notifications', d: 'Timely reminders for upcoming deadlines, status shifts, and streak achievements.' },
];

const steps = [
  { icon: MousePointer2, t: 'You act', d: 'Complete a task, drag a Kanban card, start a focus sprint.' },
  { icon: Server, t: 'API reasons', d: 'Spring Boot validates, checks ownership and logs events — all as JSON.' },
  { icon: Database, t: 'MySQL remembers', d: 'Tasks, sessions, achievements and notifications persist and recompute.' },
];

function DashMock() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const bars = [38, 62, 45, 80, 58, 92, 70];
  const R = 34, C = 2 * Math.PI * R;

  return (
    <div className="mock-scene"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setTilt({
          x: ((e.clientY - r.top) / r.height - 0.5) * -14,
          y: ((e.clientX - r.left) / r.width - 0.5) * 16
        });
      }}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}>
      <div className="mock-glow" />
      <motion.div className="mock-tilt"
        animate={{ rotateX: tilt.x, rotateY: tilt.y }}
        transition={{ type: 'spring', stiffness: 120, damping: 16 }}>
        <div className="mock-dash glass">
          <div className="mock-head">
            <span className="mdot" /><span className="mdot" /><span className="mdot" />
            <b>Mission Control</b><span className="live">● LIVE</span>
          </div>
          <div className="mock-stats">
            {[['12', '#38bdf8'], ['8', '#34d399'], ['3', '#a78bfa'], ['1', '#f87171']].map(([n, c]) => (
              <div key={c} className="mock-stat" style={{ borderColor: c }}><b>{n}</b></div>
            ))}
          </div>
          <div className="mock-cols">
            <div className="mock-chart">
              {bars.map((h, i) => (
                <motion.div key={i} className="mock-bar"
                  initial={{ height: 0 }} animate={{ height: `${h}%` }}
                  transition={{ delay: 0.5 + i * 0.08, duration: 0.6 }} />
              ))}
            </div>
            <div className="mock-ring">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="12" />
                <motion.circle cx="50" cy="50" r={R} fill="none" stroke="#34d399" strokeWidth="12"
                  strokeLinecap="round" strokeDasharray={C}
                  initial={{ strokeDashoffset: C }}
                  animate={{ strokeDashoffset: C * 0.32 }}
                  transition={{ delay: 0.8, duration: 1.4 }} transform="rotate(-90 50 50)" />
              </svg>
              <b>68%</b>
            </div>
          </div>
          <div className="mock-kanban">
            {[['#fbbf24', 2], ['#38bdf8', 3], ['#34d399', 2]].map(([c, n], i) => (
              <div key={i} className="mock-kcol">
                {Array.from({ length: n }).map((_, j) => (
                  <div key={j} className="mock-kcard" style={{ borderLeftColor: c }} />
                ))}
              </div>
            ))}
          </div>
        </div>
        <motion.div className="mock-toast glass" style={{ top: '-4%', right: '-6%' }}
          animate={{ y: [0, -12, 0] }} transition={{ repeat: Infinity, duration: 4 }}>
          ✅ Task completed <b>+10 XP</b>
        </motion.div>
        <motion.div className="mock-toast glass" style={{ bottom: '6%', left: '-10%' }}
          animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 5, delay: 1 }}>
          🔮 “Due tomorrow, high priority — do this next.”
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function Landing() {
  const { isAuth } = useAuth();
  const navigate = useNavigate();
  const [live, setLive] = useState(null);

  useEffect(() => {
    if (!localStorage.getItem('stm_token')) return;
    api.get('/dashboard/summary').then(({ data }) => setLive(data)).catch(() => {});
  }, []);

  const go = () => navigate(isAuth ? '/dashboard' : '/login');

  return (
    <>
      <Scene3D theme="dashboard" />
      <Page3D>
        <nav className="landing-nav glass">
          <Logo to="/" size={30} />
          <span className="ln-links">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
          </span>
          <span className="ln-actions">
            <button className="btn ghost" onClick={() => navigate('/login')}><LogIn size={14} /> Login</button>
            <button className="btn primary" onClick={go}>Launch <ArrowRight size={14} /></button>
          </span>
        </nav>

        <header className="landing-hero">
          <div>
            <h1 className="landing-title">
              {['Plan Smarter.', 'Work Better.', 'Achieve More.'].map((l, i) => (
                <motion.span key={l} className="grad-line" custom={i} variants={line}
                  initial="hidden" animate="show">{l}</motion.span>
              ))}
            </h1>
            <motion.p className="muted landing-sub"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
              The task manager with a mission-control soul: Kanban drag-and-drop, calendar,
              real analytics, Pomodoro focus and achievements —
              all powered by a secure REST API, all in cinematic 3D.
            </motion.p>
            <motion.div className="row landing-cta"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}>
              <button className="btn primary big" onClick={go}>
                {isAuth ? 'Open Dashboard' : 'Get Started'} <ArrowRight size={16} />
              </button>
              <a className="btn ghost big" href="#features" style={{ textAlign: 'center' }}>Explore Features</a>
            </motion.div>
            {live ? (
              <motion.div className="glass live-strip"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
                <span className="api-dot up" /> <b>Live workspace:</b>
                <span className="muted">{live.total} tasks · {live.completed} done · {live.overdue ?? 0} overdue — real API data</span>
              </motion.div>
            ) : (
              <motion.p className="muted" style={{ fontSize: 13 }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
                New here? <a href="/register">Create an account</a> to get started.
              </motion.p>
            )}
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}>
            <DashMock />
          </motion.div>
        </header>

        <section id="features" className="landing-section">
          <h2>Everything a productivity platform needs</h2>
          <p className="muted">Six modules, one backend, zero mock data.</p>
          <div className="feat-grid" style={{ padding: '20px 0 0' }}>
            {feats.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div key={f.t} className="tilt-card feat-card"
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: (i % 3) * 0.08 }}>
                  <span className="feat-icon"><Icon size={24} /></span>
                  <h3>{f.t}</h3>
                  <p className="muted">{f.d}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section id="how" className="landing-section">
          <h2>From click to database in milliseconds</h2>
          <p className="muted">The same journey every feature follows.</p>
          <div className="steps">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div key={s.t} className="step glass"
                  initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.12 }}>
                  <span className="step-num">{i + 1}</span>
                  <Icon size={26} color="#38bdf8" />
                  <h3>{s.t}</h3>
                  <p className="muted">{s.d}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        <footer className="landing-foot muted">
          SmartOne · Your focused productivity workspace
        </footer>
      </Page3D>
    </>
  );
}
