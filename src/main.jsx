import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './admin/styles/admin.css'
import App from './App.jsx'
import { scheduleOptionalFonts } from './lib/optional-fonts.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Optional brand fonts must never hold up the first website render.
scheduleOptionalFonts()
