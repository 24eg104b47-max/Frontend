import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ListTodo, KanbanSquare, CalendarDays, BarChart3,
  Timer, Trophy, Bell, LogOut, Menu, X,
  Sun, Moon, Settings as SettingsIcon, Plus, UserRound
} from 'lucide-react';
import Scene3D from './Scene3D.jsx';
import Logo from './Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import api from '../services/api.js';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'Plan' },
  { to: '/tasks', label: 'My Tasks', icon: ListTodo },
  { to: '/kanban', label: 'Kanban', icon: KanbanSquare },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/analytics', label: 'Analytics', icon: BarChart3, section: 'Insights' },
  { to: '/focus', label: 'Focus Timer', icon: Timer },
  { to: '/achievements', label: 'Achievements', icon: Trophy },
  { to: '/notifications', label: 'Notifications', icon: Bell, section: 'Organize' },
  { to: '/profile', label: 'Edit Profile', icon: UserRound, section: 'Account' },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

function greeting(name) {
  const h = new Date().getHours();
  const part = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  return `${part}, ${name}`;
}

export default function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [closed, setClosed] = useState(window.innerWidth < 900);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

  useEffect(() => {
    const onResize = () => {
      const m = window.innerWidth < 900;
      setIsMobile(m);
      if (m) setClosed(true);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && isMobile && !closed) {
        setClosed(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMobile, closed]);

  useEffect(() => {
    if (isMobile && !closed) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, closed]);
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);
  const [showDrop, setShowDrop] = useState(false);
  const [apiUp, setApiUp] = useState(null);

  useEffect(() => {
    api.get('/notifications').then(({ data }) => {
      setNotifs(data.slice(0, 6));
      setUnread(data.filter((n) => !n.read).length);
    }).catch(() => {});
    api.get('/health').then(() => setApiUp(true)).catch(() => setApiUp(false));
  }, []);

  const onLogout = async () => {
    await logout();
    navigate('/login');
  };

  const markAll = async () => {
    await Promise.all(notifs.filter((n) => !n.read).map((n) => api.patch(`/notifications/${n.id}/read`).catch(() => {})));
    setNotifs((p) => p.map((n) => ({ ...n, read: true })));
    setUnread(0);
  };

  let lastSection = '';
  return (
    <>
      <Scene3D theme="dashboard" />
      <div className="shell">
        {isMobile && !closed && (
          <div className="side-backdrop" onClick={() => setClosed(true)} />
        )}
        <motion.aside
          className={`sidebar glass ${closed ? 'closed' : ''}`}
          initial={false}
          animate={
            isMobile
              ? { x: closed ? '-105%' : '0%', width: 280 }
              : { x: 0, width: closed ? 76 : 248 }
          }
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        >
          {isMobile && (
            <div className="side-drawer-header">
              <span className="side-drawer-title">Menu</span>
              <button
                className="icon-btn close-btn"
                onClick={() => setClosed(true)}
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>
          )}
          {links.map((l) => {
            const sec = l.section && l.section !== lastSection
              ? ((lastSection = l.section), (<div key={l.section} className="side-section">{l.section}</div>))
              : null;
            const Icon = l.icon;
            return (
              <span key={l.to}>
                {sec}
                <NavLink to={l.to} className="side-link" title={l.label}
                  onClick={() => isMobile && setClosed(true)}>
                  <Icon /><span className="side-label">{l.label}</span>
                </NavLink>
              </span>
            );
          })}
          <div className="side-foot">
            <NavLink to="/add" className="side-link" onClick={() => isMobile && setClosed(true)} style={{ background: 'linear-gradient(135deg,#38bdf8,#a78bfa)', color: '#fff', marginBottom: 6 }}>
              <Plus /><span className="side-label">New Task</span>
            </NavLink>
            <button className="side-link" style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer' }} onClick={onLogout}>
              <LogOut /><span className="side-label">Logout</span>
            </button>
          </div>
        </motion.aside>

        <div className="shell-main">
          <header className={`topbar glass ${closed ? 'wide' : ''}`}>
            <button className="icon-btn" onClick={() => setClosed((c) => !c)} aria-label="Toggle sidebar"><Menu size={18} /></button>
            <Logo to="/dashboard" size={30} />
            <span className="greet">{user ? greeting(user.username) : ''} — <b>let's win today</b></span>
            <span className="grow" />
            <span title={apiUp === null ? 'Checking API…' : apiUp ? 'Backend connected' : 'Backend offline — demo data shown'}
              className={`api-dot ${apiUp === null ? '' : apiUp ? 'up' : 'down'}`} />
            <button className="icon-btn" onClick={toggle} aria-label="Toggle theme">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div style={{ position: 'relative' }}>
              <button className="icon-btn" onClick={() => setShowDrop((s) => !s)} aria-label="Notifications">
                <Bell size={18} />{unread > 0 && <span className="dot">{unread}</span>}
              </button>
              <AnimatePresence>
                {showDrop && (
                  <motion.div className="notif-drop glass" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                    <div className="row" style={{ marginTop: 0 }}>
                      <b>Notifications</b>
                      <span className="grow" />
                      <button className="btn small ghost" onClick={markAll}>Mark all read</button>
                    </div>
                    {notifs.length === 0 && <p className="muted">All quiet ✨</p>}
                    {notifs.map((n) => (
                      <div key={n.id} className={`notif-item ${n.read ? '' : 'unread'}`}>
                        <b>{n.title}</b><div className="muted">{n.message}</div>
                      </div>
                    ))}
                    <NavLink to="/notifications" className="btn small ghost" onClick={() => setShowDrop(false)}>Open center →</NavLink>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <NavLink to="/profile" title="Edit profile" className="avatar" style={{ textDecoration: 'none' }}>
              {user?.username?.[0]?.toUpperCase()}
            </NavLink>
          </header>
          <Outlet />
        </div>
      </div>
    </>
  );
}
