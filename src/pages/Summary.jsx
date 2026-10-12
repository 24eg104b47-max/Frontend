import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Page3D, TiltCard } from '../components/fx.jsx';
import api from '../services/api.js';

export default function Summary() {
  const [s, setS] = useState({ total: 0, todo: 0, pending: 0, inProgress: 0, inReview: 0, completed: 0 });

  useEffect(() => {
    api.get('/dashboard/summary')
      .then(({ data }) => setS(data))
      .catch(() => setS({ total: 6, todo: 2, inProgress: 2, inReview: 0, completed: 2 }));
  }, []);

  const todo = s.todo ?? s.pending ?? 0;
  const rows = [
    ['Completed', s.completed, '#34d399', '✅'],
    ['In Progress', s.inProgress, '#38bdf8', '🚀'],
    ['In Review', s.inReview, '#a78bfa', '👀'],
    ['To Do', todo, '#fbbf24', '⏳']
  ];

  return (
    <Page3D>
      <div className="container">
        <h1>Task Summary 📊</h1>
        <p className="muted">{s.total} total tasks — progress at a glance in 3D.</p>
        <div className="grid3" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {rows.map(([label, v, color, icon], i) => {
            const pct = s.total ? Math.round((v / s.total) * 100) : 0;
            return (
              <TiltCard key={label} glow={color}>
                <div className="sum-card">
                  <span className="stat-icon" style={{ background: color }}>{icon}</span>
                  <h2>{v}</h2>
                  <p>{label}</p>
                  <div className="bar"><motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.3 + i * 0.2, duration: 1 }} style={{ background: color }} /></div>
                  <b>{pct}%</b>
                </div>
              </TiltCard>
            );
          })}
        </div>
        <TiltCard className="panel" glow="#38bdf8">
          <h3>Completion meter</h3>
          <div className="meter">
            <motion.div className="meter-fill" initial={{ width: 0 }}
              animate={{ width: `${s.total ? (s.completed / s.total) * 100 : 0}%` }}
              transition={{ duration: 1.2 }} />
          </div>
          <p className="muted">{s.completed} of {s.total} tasks completed. Full charts live on the <a href="/analytics">Analytics</a> page.</p>
        </TiltCard>
      </div>
    </Page3D>
  );
}
