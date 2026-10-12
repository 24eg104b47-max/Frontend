import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import {
  Package, CheckCircle2, Rocket, ClipboardList, AlarmClock, Percent,
  Plus, ListTodo, CalendarDays, BarChart3
} from 'lucide-react';
import { Page3D, TiltCard } from '../components/fx.jsx';
import api, { demoTasks } from '../services/api.js';
import { normalizeStatus, statusLabel, statusBadge, isOverdue, fmtDate } from '../utils/tasks.js';

function useCountUp(target, duration = 1100) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf; const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      setVal(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

function Stat({ label, value, color, icon: Icon, suffix = '' }) {
  const n = useCountUp(Number(value) || 0);
  return (
    <TiltCard className="stat" glow={color}>
      <div className="stat-icon" style={{ background: color }}><Icon size={22} color="#fff" /></div>
      <h3>{n}{suffix}</h3>
      <p>{label}</p>
    </TiltCard>
  );
}

const DONUT = [
  { key: 'todo', color: '#fbbf24' },
  { key: 'inProgress', color: '#38bdf8' },
  { key: 'inReview', color: '#a78bfa' },
  { key: 'completed', color: '#34d399' },
];
const LABELS = { todo: 'To Do', inProgress: 'In Progress', inReview: 'In Review', completed: 'Completed' };

export default function Dashboard() {
  const [summary, setSummary] = useState({ total: 0, todo: 0, pending: 0, inProgress: 0, inReview: 0, completed: 0, overdue: 0, completionRate: 0 });
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [s, t] = await Promise.all([api.get('/dashboard/summary'), api.get('/tasks')]);
        setSummary(s.data);
        setTasks(t.data);
      } catch {
        setOffline(true);
        setTasks(demoTasks);
        setSummary({ total: 3, todo: 1, pending: 1, inProgress: 1, inReview: 0, completed: 1, overdue: 1, completionRate: 33.3 });
      } finally { setLoading(false); }
    })();
  }, []);

  const todo = summary.todo ?? summary.pending ?? 0;
  const donut = DONUT.map((d) => ({ name: LABELS[d.key], value: summary[d.key] || 0, color: d.color }))
    .filter((d) => d.value > 0);
  const todayStr = new Date().toISOString().slice(0, 10);
  const dueToday = tasks.filter((t) => t.deadline === todayStr && normalizeStatus(t.status) !== 'COMPLETED');
  const overdue = tasks.filter(isOverdue);
  const upcoming = tasks.filter((t) => t.deadline && t.deadline > todayStr && normalizeStatus(t.status) !== 'COMPLETED')
    .sort((a, b) => a.deadline.localeCompare(b.deadline)).slice(0, 4);
  const recentDone = tasks.filter((t) => normalizeStatus(t.status) === 'COMPLETED').slice(0, 4);

  return (
    <Page3D>
      <div className="container">
        <div className="hero">
          <div>
            <h1>Mission Control 🛸</h1>
            <p className="muted">{loading ? 'Loading telemetry…' : `${summary.total} tasks in orbit • ${summary.completionRate ?? 0}% complete`}</p>
          </div>
          <Link className="btn primary" to="/add"><Plus size={15} /> New Task</Link>
        </div>
        {offline && <div className="alert warn">Backend offline — showing labeled demo data.</div>}

        <div className="grid4" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
          <Stat label="Total" value={summary.total} color="#38bdf8" icon={Package} />
          <Stat label="Completed" value={summary.completed} color="#34d399" icon={CheckCircle2} />
          <Stat label="In Progress" value={summary.inProgress} color="#a78bfa" icon={Rocket} />
          <Stat label="To Do" value={todo} color="#fbbf24" icon={ClipboardList} />
          <Stat label="Overdue" value={summary.overdue} color="#f87171" icon={AlarmClock} />
          <Stat label="Done %" value={summary.completionRate ?? 0} color="#f472b6" icon={Percent} suffix="%" />
        </div>

        <div className="grid2">
          <TiltCard className="panel" glow="#a78bfa">
            <h3>Status distribution (live)</h3>
            {donut.length === 0 ? <div className="empty">No data yet — <Link to="/add">create a task</Link></div> : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={donut} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={3}>
                    {donut.map((d) => <Cell key={d.name} fill={d.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="bars">
              {DONUT.map((d) => (
                <div key={d.key} className="bar-row">
                  <span>{LABELS[d.key]}</span>
                  <div className="bar"><motion.div initial={{ width: 0 }}
                    animate={{ width: `${summary.total ? ((summary[d.key] || 0) / summary.total) * 100 : 0}%` }}
                    style={{ background: d.color }} /></div>
                  <b>{summary[d.key] || 0}</b>
                </div>
              ))}
            </div>
          </TiltCard>

          <TiltCard className="panel" glow="#34d399">
            <h3>Today's overview</h3>
            <p>📅 Due today: <b>{dueToday.length}</b> • 🔥 Overdue: <b>{overdue.length}</b></p>
            {overdue.slice(0, 3).map((t) => (
              <div key={t.id} className="recent-row">
                <span className="badge overdue-tag">overdue</span>
                <span className="rtitle">{t.title}</span>
                <span className="muted">{fmtDate(t.deadline)}</span>
              </div>
            ))}
            {upcoming.map((t) => (
              <div key={t.id} className="recent-row">
                <span className={statusBadge(t.status)}>{statusLabel(t.status)}</span>
                <span className="rtitle">{t.title}</span>
                <span className="muted">{fmtDate(t.deadline)}</span>
              </div>
            ))}
            {recentDone.length > 0 && <p className="muted">✅ Recently done: {recentDone.map((t) => t.title).join(', ')}</p>}
            <div className="row">
              <Link className="btn ghost" to="/tasks"><ListTodo size={14} /> My Tasks</Link>
              <Link className="btn ghost" to="/calendar"><CalendarDays size={14} /> Calendar</Link>
              <Link className="btn ghost" to="/analytics"><BarChart3 size={14} /> Analytics</Link>
            </div>
          </TiltCard>
        </div>
      </div>
    </Page3D>
  );
}
