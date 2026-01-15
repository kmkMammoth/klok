/**
 * Applicatie-entrypoint voor de frontend.
 *
 * Doel:
 * - Initialiseert React root.
 * - Wrapt de app in React.StrictMode voor extra waarschuwingen.
 * - Activeert client-side routing via BrowserRouter.
 * - Optioneel: performance-meting via reportWebVitals.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/Global.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';

// Initialiseert de React root en mount onder het element met id 'root'
const root = ReactDOM.createRoot(document.getElementById('root'));
// Render de applicatie met StrictMode en BrowserRouter (client-side routing)
root.render(
  <React.StrictMode>
    <BrowserRouter>
        <App />
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();