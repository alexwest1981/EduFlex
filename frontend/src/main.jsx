import { createRoot } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import i18n, { initDynamicLanguages } from './i18n';
import './index.css';
import App from './App.jsx';
import { BrandingProvider } from './context/BrandingContext';

// Initialize dynamic languages from API
// initDynamicLanguages(); // Moved to App.jsx for safer initialization

// StrictMode disabled: OnlyOffice DocEditor doesn't handle React 18's double-mount in dev mode
// Re-enable after OnlyOffice integration is stable, or use production build
createRoot(document.getElementById('root')).render(
  <BrandingProvider>
    <App />
  </BrandingProvider>
)
