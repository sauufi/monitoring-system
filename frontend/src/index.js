// frontend/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { setAuthToken } from './utils/setAuthToken';

// Check for token in local storage
if (localStorage.token) {
  setAuthToken(localStorage.token);
}

// Create root and render app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);