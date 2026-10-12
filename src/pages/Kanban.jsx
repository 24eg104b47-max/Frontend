import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Page3D } from '../components/fx.jsx';
import api from '../services/api.js';
import { normalizeStatus, statusLabel, isOverdue, priorityRank } from '../utils/tasks.js';

const COLS = [
  { key: 'TODO', color: '#fbbf24' },
  { key: 'IN_PROGRESS', color: '#38bdf8' },
  { key: 'IN_REVIEW', color: '#a78bfa' },
  { key: 'COMPLETED', color: '#34d399' },
];

export default function Kanban() {
  const [tasks, setTasks] = useState([]);
  const [dragId, setDragId] = useState(null);
  const [overCol, setOverCol] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/tasks').then(({ data }) => setTasks(data)).catch(() => setTasks([]));
  }, []);

  const move = async (id, status) => {
    setTasks((p) => p.map((t) => (t.id === id ? { ...t, status } : t)));
    try {
      await api.patch(`/tasks/${id}/status`, { status });
    } catch { /* offline: keep optimistic move */ }
    setOverCol(null);
  };

  return (
    <Page3D>
      <div className="container" style={{ maxWidth: 1300 }}>
        <div className="hero">
          <div><h1>Kanban Board 🗂️</h1><p className="muted">Drag cards between columns — status syncs to the backend. Fallback: use the ▾ menu on each card.</p></div>
          <Link className="btn primary" to="/add"><Plus size={15} /> Add Task</Link>
        </div>
        <div className="kanban">
          {COLS.map((c) => {
            const cards = tasks.filter((t) => normalizeStatus(t.status) === c.key)
              .sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority));
            return (
              <div key={c.key}
                className={`kcol glass ${overCol === c.key ? 'dragover' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setOverCol(c.key); }}
                onDragLeave={() => setOverCol(null)}
                onDrop={(e) => { e.preventDefault(); const id = Number(e.dataTransfer.getData('text/plain') || dragId); if (id) move(id, c.key); }}>
                <div className="row" style={{ marginTop: 0, alignItems: 'center' }}>
                  <span className="badge" style={{ background: `${c.color}22`, color: c.color }}>{statusLabel(c.key)} • {cards.length}</span>
                  <span className="grow" style={{ flex: 1 }} />
                  <button className="btn small ghost" onClick={() => navigate(`/add?status=${c.key}`)} title={`Create in ${statusLabel(c.key)}`}>+ Add</button>
                </div>
                {cards.map((t) => (
                  <motion.div key={t.id}
                    className={`kcard ${dragId === t.id ? 'dragging' : ''}`}
                    layout draggable
                    onDragStart={(e) => { setDragId(t.id); e.dataTransfer.setData('text/plain', String(t.id)); }}
                    onDragEnd={() => setDragId(null)}
                    whileHover={{ y: -3 }}>
                    <b>{t.title}</b>
                    <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span className={`badge ${String(t.priority).toLowerCase()}`}>{t.priority}</span>
                      {t.deadline && <small className="muted">📅 {t.deadline}</small>}
                      {isOverdue(t) && <span className="badge overdue-tag">overdue</span>}
                    </div>
                    <select value={normalizeStatus(t.status)} onChange={(e) => move(t.id, e.target.value)}
                      style={{ marginTop: 8 }} aria-label="Change status">
                      {COLS.map((o) => <option key={o.key} value={o.key}>{statusLabel(o.key)}</option>)}
                    </select>
                  </motion.div>
                ))}
                {cards.length === 0 && <p className="muted" style={{ fontSize: 13 }}>Drop cards here ✨</p>}
              </div>
            );
          })}
        </div>
      </div>
    </Page3D>
  );
}
