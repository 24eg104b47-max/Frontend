import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api.js';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('stm_theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('stm_theme', theme);
  }, [theme ]);

  useEffect(() => {
    // sync server-side preferences when logged in
    if (!localStorage.getItem('stm_token')) return;
    api.get('/preferences').then(({ data }) => {
      if (data.theme && data.theme !== theme) setTheme(data.theme);
      if (data.accent) {
        document.documentElement.style.setProperty('--accent', data.accent);
        localStorage.setItem('stm_accent', data.accent);
      }
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persist = async (next) => {
    setTheme(next);
    if (localStorage.getItem('stm_token')) {
      try {
        const cur = (await api.get('/preferences')).data;
        await api.put('/preferences', { ...cur, theme: next });
      } catch { /* offline-friendly */ }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggle: () => persist(theme === 'dark' ? 'light' : 'dark') }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
