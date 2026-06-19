import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Amazon from './Amazon.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Amazon />
  </StrictMode>
)