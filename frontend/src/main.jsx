import './i18n';
// import { StrictMode } from 'react'  // Temporarily disabled for OnlyOffice compatibility
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// StrictMode disabled: OnlyOffice DocEditor doesn't handle React 18's double-mount in dev mode
// Re-enable after OnlyOffice integration is stable, or use production build
createRoot(document.getElementById('root')).render(
  <App />,
)
