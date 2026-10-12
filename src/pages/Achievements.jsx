import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Page3D, TiltCard } from '../components/fx.jsx';
import api from '../services/api.js';

export default function Achievements() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/achievements').then(({ data }) => setData(data))
      .catch(() => setError('Achievements need the backend — badges are computed from real completion events.'));
  }, []);

  if (error) return <Page3D><div className="container"><div className="alert warn">{error}</div></div></Page3D>;
  if (!data) return <Page3D><div className="container"><div className="skel" style={{ height: 220 }} /></div></Page3D>;

  const earned = data.achievements.filter((a) => a.earned);
  const pct = Math.min(100, (data.xp % 50) / 50 * 100);

  return (
    <Page3D>
      <div className="container">
        <h1>Achievements 🏆</h1>
        <p className="muted">Level <b>{data.level}</b> • <b>{data.xp} XP</b> • {earned.length}/{data.achievements.length} badges — earned from stored events only.</p>
        <TiltCard className="panel" glow="#fbbf24">
          <h3>Level {data.level} journey</h3>
          <div className="meter"><motion.div className="meter-fill" initial={{ width: 0 }} animate={{ width: `${pct}%` }} /></div>
          <p className="muted">{50 - (data.xp % 50)} XP to level {data.level + 1}. Next completion pushes you forward — no grinding by toggling.</p>
        </TiltCard>
        <div className="ach-grid">
          {data.achievements.map((a, i) => (
            <motion.div key={a.code} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }}>
              <TiltCard className={`ach ${a.earned ? 'earned' : ''}`} glow="#fbbf24">
                <div className="big">{a.icon}</div>
                <h3 style={{ margin: '8px 0 4px' }}>{a.name}</h3>
                <p className="muted" style={{ fontSize: 13 }}>{a.description}</p>
                <span className="chip">+{a.xp} XP</span>
                {a.earned && <div>✅ earned</div>}
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </Page3D>
  );
}
