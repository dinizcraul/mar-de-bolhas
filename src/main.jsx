import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { iniciarPixel } from './pixel'
import { guardarUtms } from './utms'

guardarUtms()
iniciarPixel()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
