
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// React ilovasini HTML dagi 'root' elementiga ulaymiz
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
