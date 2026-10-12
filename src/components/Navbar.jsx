import { NavLink, useNavigate } from 'react-router-dom';
import { ListChecks } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="nav3d glass">
      <div className="brand" onClick={() => navigate(user ? '/dashboard' : '/login')}>
        <span className="brand-logo" aria-hidden="true"><ListChecks size={18} /></span>
        <span>SmartOne</span>
      </div>
      {user && (
        <nav>
          <NavLink to="/dashboard">Home</NavLink>
          <NavLink to="/tasks">My Tasks</NavLink>
          <NavLink to="/add">Add Task</NavLink>
          <NavLink to="/summary">Summary</NavLink>
          <NavLink to="/settings">Settings</NavLink>
        </nav>
      )}
      <div className="nav-right">
        {user ? (
          <>
            <span className="avatar">{user.username?.[0]?.toUpperCase()}</span>
            <span className="hello">{user.username}</span>
            <button className="btn ghost" onClick={onLogout}>Logout</button>
          </>
        ) : (
          <>
            <NavLink className="btn ghost" to="/login">Login</NavLink>
            <NavLink className="btn primary" to="/register">Register</NavLink>
          </>
        )}
      </div>
    </header>
  );
}
