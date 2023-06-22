import React from 'react';
import { createRoot } from 'react-dom/client';
import './style/styles.css';
import App from './App';
import './style/index.css';

const container = document.getElementById('app');
const root = createRoot(container);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);