import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import CardApp from './CardApp'
import './card.css'

createRoot(document.getElementById('card-root')!).render(
  <StrictMode>
    <CardApp />
  </StrictMode>,
)
