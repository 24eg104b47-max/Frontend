import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, PieChart, Pie, Cell, Legend
} from 'recharts';
import { Page3D, TiltCard } from '../components/fx.jsx';
import api from '../services/api.js';

const COLORS = ['#38bdf8', '#a78bfa', '#34d399', '#fbbf24', '#f472b6', '#f87171'];

export default function Analytics() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard/productivity').then(({ data }) => setData(data))
      .catch(() => setError('Backend offline — charts need live data. Start the Spring Boot API.'));
  }, []);

  if (error) return <Page3D><div className="container"><div className="alert warn">{error}</div></div></Page3D>;
  if (!data) return <Page3D><div className="container"><div className="grid2"><div className="skel" style={{ height: 260 }} /><div className="skel" style={{ height: 260 }} /></div></div></Page3D>;

  const statusData = Object.entries(data.statusDistribution || {}).map(([name, value], i) =>
    ({ name: name.replace(/_/g, ' '), value, fill: COLORS[i % COLORS.length] }));
  const priData = Object.entries(data.priorityDistribution || {}).map(([name, value], i) =>
    ({ name, value, fill: COLORS[(i + 2) % COLORS.length] }));
  const weekly = (data.weeklyCompletion || []).map((w) => ({ ...w, trend: w.completed }));

  return (
    <Page3D>
      <div className="container" style={{ maxWidth: 1200 }}>
        <h1>Analytics 📊</h1>
        <p className="muted">100% live backend data • overdue: <b>{data.overdue}</b> • due today: <b>{data.dueToday}</b> • focus today: <b>{data.focusMinutesToday} min</b></p>
        <div className="grid2">
          <TiltCard className="panel" glow="#38bdf8">
            <h3>Weekly completions</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={weekly}>
                <XAxis dataKey="day" stroke="#9aa3c7" />
                <YAxis stroke="#9aa3c7" allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="completed" fill="#38bdf8" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </TiltCard>
          <TiltCard className="panel" glow="#a78bfa">
            <h3>Productivity trend</h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={weekly}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.1)" />
                <XAxis dataKey="day" stroke="#9aa3c7" />
                <YAxis stroke="#9aa3c7" allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="trend" stroke="#a78bfa" strokeWidth={3} dot={{ fill: '#a78bfa' }} />
              </LineChart>
            </ResponsiveContainer>
          </TiltCard>
        </div>
        <div className="grid2">
          <TiltCard className="panel" glow="#34d399">
            <h3>Status distribution</h3>
            {statusData.length === 0 ? <p className="muted">No tasks yet.</p> : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3} label>
                    {statusData.map((d) => <Cell key={d.name} fill={d.fill} />)}
                  </Pie>
                  <Tooltip /><Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </TiltCard>
          <TiltCard className="panel" glow="#fbbf24">
            <h3>Priority distribution</h3>
            {priData.length === 0 ? <p className="muted">No tasks yet.</p> : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={priData} dataKey="value" nameKey="name" outerRadius={90} paddingAngle={3} label>
                    {priData.map((d) => <Cell key={d.name} fill={d.fill} />)}
                  </Pie>
                  <Tooltip /><Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </TiltCard>
        </div>
      </div>
    </Page3D>
  );
}
