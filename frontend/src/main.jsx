import { createRoot } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import './index.css';
import App from './App.jsx';

// StrictMode disabled: OnlyOffice DocEditor doesn't handle React 18's double-mount in dev mode
// Re-enable after OnlyOffice integration is stable, or use production build
createRoot(document.getElementById('root')).render(
  <I18nextProvider i18n={i18n}>
    <App />
  </I18nextProvider>,
)
