import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/anton/latin-400.css'
import '@fontsource-variable/inter-tight/wght.css'
import '@fontsource/instrument-serif/latin-400-italic.css'
import '@fontsource/khand/devanagari-700.css'
import '@fontsource/khand/latin-700.css'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
