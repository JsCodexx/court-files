import { suppressExtensionDevOverlay } from './dev/suppressExtensionDevOverlay';
import { captureInstallPrompt } from './pwa/captureInstallPrompt';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/global.css';
import reportWebVitals from './reportWebVitals';

suppressExtensionDevOverlay();
captureInstallPrompt();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
