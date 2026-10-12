import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

const accent = localStorage.getItem('stm_accent');
if (accent) document.documentElement.style.setProperty('--accent', accent);
document.documentElement.setAttribute('data-theme', localStorage.getItem('stm_theme') || 'dark');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
