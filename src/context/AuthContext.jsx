import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('stm_user')) || null; }
    catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const saveSession = (data) => {
    localStorage.setItem('stm_token', data.token);
    const u = { id: data.id, username: data.username, email: data.email };
    localStorage.setItem('stm_user', JSON.stringify(u));
    setUser(u);
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', payload);
      saveSession(data);
      return data;
    } finally { setLoading(false); }
  };

  const login = async (payload) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', payload);
      saveSession(data);
      return data;
    } finally { setLoading(false); }
  };

  const demoLogin = async (username = 'Bannu') => {
    try {
      const { data } = await api.post('/auth/login', { usernameOrEmail: username, password: '123456' });
      saveSession(data);
      return data;
    } catch {
      const data = { token: 'demo-token', id: 1, username, email: `${username.toLowerCase()}@example.com` };
      saveSession(data);
      return data;
    }
  };

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch { /* offline-friendly */ }
    localStorage.removeItem('stm_token');
    localStorage.removeItem('stm_user');
    setUser(null);
  };

  /** Refresh local session after profile edits (server may rotate the JWT). */
  const syncSession = (data) => {
    if (data.token) localStorage.setItem('stm_token', data.token);
    const u = { id: data.id ?? user?.id, username: data.username, email: data.email };
    localStorage.setItem('stm_user', JSON.stringify(u));
    setUser(u);
  };

  useEffect(() => {
    const token = localStorage.getItem('stm_token');
    if (token === 'demo-token') {
      api.post('/auth/login', { usernameOrEmail: 'Bannu', password: '123456' })
        .then(({ data }) => saveSession(data))
        .catch(() => {});
    }
    const onStorage = () => {
      try { setUser(JSON.parse(localStorage.getItem('stm_user'))); }
      catch { /* ignore */ }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, demoLogin, register, logout, syncSession, isAuth: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
