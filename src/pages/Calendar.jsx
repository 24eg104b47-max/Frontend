import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Page3D, TiltCard } from '../components/fx.jsx';
import api from '../services/api.js';
import { normalizeStatus, statusLabel, isOverdue } from '../utils/tasks.js';

const PRI_COLOR = { Critical: '#f43f5e', High: '#f87171', Medium: '#fbbf24', Low: '#34d399' };

export default function Calendar() {
  const [tasks, setTasks] = useState([]);
  const [cursor, setCursor] = useState(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() }; });
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/tasks').then(({ data }) => setTasks(data)).catch(() => setTasks([]));
  }, []);

  const byDate = useMemo(() => {
    const map = {};
    for (const t of tasks) {
      if (!t.deadline) continue;
      (map[t.deadline] = map[t.deadline] || []).push(t);
    }
    return map;
  }, [tasks]);

  const cells = useMemo(() => {
    const first = new Date(cursor.y, cursor.m, 1);
    const startDay = (first.getDay() + 6) % 7; // Monday-first
    const out = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(cursor.y, cursor.m, 1 - startDay + i);
      out.push(d);
    }
    return out;
  }, [cursor]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const upcoming = tasks.filter((t) => t.deadline && t.deadline >= todayStr && normalizeStatus(t.status) !== 'COMPLETED')
    .sort((a, b) => a.deadline.localeCompare(b.deadline)).slice(0, 8);
  const selTasks = selected ? (byDate[selected] || []) : [];
  const monthName = new Date(cursor.y, cursor.m, 1).toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <Page3D>
      <div className="container" style={{ maxWidth: 1200 }}>
        <div className="hero">
          <div><h1>Calendar 📆</h1><p className="muted">Deadlines color-coded by priority. Click a day to inspect or create.</p></div>
          <div className="row" style={{ marginTop: 0 }}>
            <button className="icon-btn" onClick={() => setCursor((c) => c.m === 0 ? { y: c.y - 1, m: 11 } : { y: c.y, m: c.m - 1 })}><ChevronLeft size={18} /></button>
            <b>{monthName}</b>
            <button className="icon-btn" onClick={() => setCursor((c) => c.m === 11 ? { y: c.y + 1, m: 0 } : { y: c.y, m: c.m + 1 })}><ChevronRight size={18} /></button>
          </div>
        </div>
        <div className="grid2" style={{ gridTemplateColumns: '2fr 1fr' }}>
          <TiltCard className="panel" glow="#38bdf8">
            <div className="cal-grid">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => <div key={d} className="cal-dow">{d}</div>)}
              {cells.map((d) => {
                const key = d.toISOString().slice(0, 10);
                const inMonth = d.getMonth() === cursor.m;
                const dayTasks = byDate[key] || [];
                return (
                  <div key={key + d.getMonth()} onClick={() => setSelected(key)}
                    className={`cal-day ${inMonth ? '' : 'dim'} ${key === todayStr ? 'today' : ''}`}>
                    <b>{d.getDate()}</b>
                    {dayTasks.slice(0, 3).map((t) => (
                      <div key={t.id} className="cal-chip"
                        style={{ background: `${PRI_COLOR[t.priority] || '#38bdf8'}33`, color: PRI_COLOR[t.priority] || '#38bdf8' }}>
                        {t.title}
                      </div>
                    ))}
                    {dayTasks.length > 3 && <div className="muted">+{dayTasks.length - 3} more</div>}
                  </div>
                );
              })}
            </div>
          </TiltCard>
          <div>
            <TiltCard className="panel" glow="#a78bfa">
              <h3>Upcoming deadlines</h3>
              {upcoming.length === 0 && <p className="muted">Nothing scheduled 🎉</p>}
              {upcoming.map((t) => (
                <div key={t.id} className="timeline-item">
                  <span className={`badge ${String(t.priority).toLowerCase()}`}>{t.priority}</span>
                  <div><b>{t.title}</b><div className="muted">{t.deadline} • {statusLabel(t.status)}{isOverdue(t) && ' • ⚠️ overdue'}</div></div>
                </div>
              ))}
            </TiltCard>
            <AnimatePresence>
              {selected && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <TiltCard className="panel" glow="#34d399" >
                    <h3>{selected}</h3>
                    {selTasks.length === 0 && <p className="muted">No tasks due.</p>}
                    {selTasks.map((t) => (
                      <div key={t.id} className="recent-row">
                        <span className="rtitle">{t.title}</span>
                        <Link className="btn small" to={`/edit/${t.id}`}>Open</Link>
                      </div>
                    ))}
                    <button className="btn primary" onClick={() => navigate(`/add?deadline=${selected}`)}>+ Create on this date</button>
                  </TiltCard>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Page3D>
  );
}
