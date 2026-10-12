import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Copy, CheckCheck } from 'lucide-react';
import { Page3D, TiltCard } from '../components/fx.jsx';
import api, { demoTasks } from '../services/api.js';
import { normalizeStatus, statusLabel, statusBadge, STATUSES } from '../utils/tasks.js';

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [statusF, setStatusF] = useState('All');
  const [priorityF, setPriorityF] = useState('All');
  const [sort, setSort] = useState('newest');
  const [confirmId, setConfirmId] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [completeAnim, setCompleteAnim] = useState(null);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const { data } = await api.get('/tasks');
      setTasks(data);
    } catch {
      setTasks(demoTasks.map((t) => ({ ...t, status: t.status === 'In_Progress' ? 'IN_PROGRESS' : t.status === 'Pending' ? 'TODO' : 'COMPLETED' })));
      setError('Backend offline — showing labeled demo data.');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    try { await api.delete(`/tasks/${id}`); } catch { /* offline */ }
    setTasks((p) => p.filter((t) => t.id !== id));
    setConfirmId(null);
  };

  const duplicate = async (id) => {
    try {
      const { data } = await api.post(`/tasks/${id}/duplicate`);
      setTasks((p) => [data, ...p]);
    } catch { setError('Duplicate needs the backend.'); }
  };

  const complete = async (id) => {
    setTasks((p) => p.map((t) => (t.id === id ? { ...t, status: 'COMPLETED' } : t)));
    const dt = demoTasks.find((t) => t.id === id);
    if (dt) dt.status = 'COMPLETED';
    setCompleteAnim(id);
    setTimeout(() => setCompleteAnim(null), 500);

    try {
      await api.patch(`/tasks/${id}/status`, { status: 'COMPLETED' });
    } catch {
      /* offline fallback already updated */
    }
  };

  const bulkComplete = async () => {
    const ids = new Set(selected);
    setSelected(new Set());
    setTasks((p) => p.map((t) => (ids.has(t.id) ? { ...t, status: 'COMPLETED' } : t)));
    demoTasks.forEach((t) => { if (ids.has(t.id)) t.status = 'COMPLETED'; });

    await Promise.all([...ids].map((id) =>
      api.patch(`/tasks/${id}/status`, { status: 'COMPLETED' }).catch(() => {})));
  };

  const toggleSel = (id) => setSelected((p) => {
    const n = new Set(p);
    if (n.has(id)) n.delete(id); else n.add(id);
    return n;
  });

  const filtered = useMemo(() => {
    let list = [...tasks];
    if (q) list = list.filter((t) => (t.title + ' ' + (t.description || '') + ' ' + (t.tags || '')).toLowerCase().includes(q.toLowerCase()));
    if (statusF !== 'All') list = list.filter((t) => normalizeStatus(t.status) === statusF);
    if (priorityF !== 'All') list = list.filter((t) => t.priority === priorityF);
    list.sort((a, b) => {
      if (sort === 'deadline') return new Date(a.deadline || '9999') - new Date(b.deadline || '9999');
      if (sort === 'priority') return { Critical: 0, High: 1, Medium: 2, Low: 3 }[a.priority] - { Critical: 0, High: 1, Medium: 2, Low: 3 }[b.priority];
      if (sort === 'title') return a.title.localeCompare(b.title);
      return (b.id || 0) - (a.id || 0);
    });
    return list;
  }, [tasks, q, statusF, priorityF, sort]);

  return (
    <Page3D>
      <div className="container">
        <div className="hero">
          <div><h1>My Tasks 📋</h1><p className="muted">{filtered.length} task(s) • search, filter, sort, bulk-complete</p></div>
          <Link className="btn primary" to="/add"><Plus size={15} /> Add Task</Link>
        </div>

        <TiltCard className="panel toolbar" glow="#38bdf8">
          <input className="search" placeholder="🔍 Search title, description, tags…" value={q} onChange={(e) => setQ(e.target.value)} />
          <select value={statusF} onChange={(e) => setStatusF(e.target.value)}>
            <option value="All">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
          </select>
          <select value={priorityF} onChange={(e) => setPriorityF(e.target.value)}>
            {['All', 'Critical', 'High', 'Medium', 'Low'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="deadline">Deadline</option>
            <option value="priority">Priority</option>
            <option value="title">Title</option>
          </select>
        </TiltCard>

        {selected.size > 0 && (
          <div className="glass" style={{ padding: 10, marginBottom: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
            <b>{selected.size} selected</b>
            <button className="btn small primary" onClick={bulkComplete}><CheckCheck size={14} /> Mark completed</button>
            <button className="btn small ghost" onClick={() => setSelected(new Set())}>Clear</button>
          </div>
        )}

        {error && <div className="alert warn">{error}</div>}
        {loading ? <div className="loader"><div className="spinner" /> Loading tasks…</div>
          : filtered.length === 0 ? (
            <TiltCard className="panel empty" glow="#a78bfa">🪐 Nothing here. <Link to="/add">Create your first task</Link></TiltCard>
          ) : (
            <div className="table-wrap glass">
              <table>
                <thead><tr><th></th><th>Title</th><th>Priority</th><th>Deadline</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  <AnimatePresence>
                    {filtered.map((t) => (
                      <motion.tr key={t.id}
                        initial={{ opacity: 0, y: 12 }} animate={completeAnim === t.id ? { scale: 1.04, backgroundColor: 'rgba(52,211,153,.25)' } : { opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 60 }}>
                        <td><input type="checkbox" checked={selected.has(t.id)} onChange={() => toggleSel(t.id)} aria-label="Select task" /></td>
                        <td><b>{t.title}</b><div className="desc">{t.description}</div></td>
                        <td><span className={`badge ${String(t.priority).toLowerCase()}`}>{t.priority}</span></td>
                        <td>{t.deadline || '—'}</td>
                        <td><span className={statusBadge(t.status)}>{statusLabel(t.status)}</span></td>
                        <td className="actions">
                          {normalizeStatus(t.status) !== 'COMPLETED' && (
                            <button className="btn small primary" title="Mark completed" onClick={() => complete(t.id)}>✓</button>
                          )}
                          <Link className="btn small" to={`/edit/${t.id}`}><Pencil size={13} /></Link>
                          <button className="btn small" title="Duplicate" onClick={() => duplicate(t.id)}><Copy size={13} /></button>
                          <button className="btn small danger" onClick={() => setConfirmId(t.id)}><Trash2 size={13} /></button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}

        <AnimatePresence>
          {confirmId && (
            <motion.div className="modal-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div className="modal glass" initial={{ scale: 0.85, rotateX: 12 }} animate={{ scale: 1, rotateX: 0 }}>
                <h3>Delete this task?</h3>
                <p className="muted">This floats away forever. Are you sure?</p>
                <div className="row">
                  <button className="btn ghost" onClick={() => setConfirmId(null)}>Cancel</button>
                  <button className="btn danger" onClick={() => remove(confirmId)}>Delete</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Page3D>
  );
}
