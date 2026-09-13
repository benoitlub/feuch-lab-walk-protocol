import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';
import './app-shell.css';
import './octopus.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/feuch-lab-walk-protocol/sw.js').catch(() => {
      // Offline support is optional; the experiment remains usable online.
    });
  });
}
